/**
 * BigDaddyG Native Ollama HTTP Client
 * 
 * High-performance native HTTP client for Ollama
 * Uses native code for better performance than Node.js fetch
 * 
 * Compiles with: MSVC, Clang, MinGW
 */

#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#ifdef _WIN32
    #define WIN32_LEAN_AND_MEAN
    #include <windows.h>
    #include <winhttp.h>
    #pragma comment(lib, "winhttp.lib")
#else
    #include <curl/curl.h>
#endif

// ============================================================================
// STRUCTURES
// ============================================================================

typedef struct {
    char* data;
    size_t size;
    size_t capacity;
} ResponseBuffer;

typedef struct {
    char* content;
    int status_code;
    double request_time;
    size_t response_size;
} HttpResponse;

// Global state
static bool g_initialized = false;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create response buffer
 */
static ResponseBuffer* create_buffer() {
    ResponseBuffer* buf = (ResponseBuffer*)malloc(sizeof(ResponseBuffer));
    if (!buf) return NULL;
    
    buf->capacity = 4096;
    buf->size = 0;
    buf->data = (char*)malloc(buf->capacity);
    
    if (!buf->data) {
        free(buf);
        return NULL;
    }
    
    return buf;
}

/**
 * Append to buffer
 */
static bool append_to_buffer(ResponseBuffer* buf, const char* data, size_t len) {
    if (!buf || !data) return false;
    
    // Expand if needed
    while (buf->size + len >= buf->capacity) {
        size_t new_capacity = buf->capacity * 2;
        char* new_data = (char*)realloc(buf->data, new_capacity);
        if (!new_data) return false;
        
        buf->data = new_data;
        buf->capacity = new_capacity;
    }
    
    memcpy(buf->data + buf->size, data, len);
    buf->size += len;
    buf->data[buf->size] = '\0';
    
    return true;
}

/**
 * Free buffer
 */
static void free_buffer(ResponseBuffer* buf) {
    if (!buf) return;
    if (buf->data) free(buf->data);
    free(buf);
}

/**
 * Free HTTP response
 */
static void free_http_response(HttpResponse* response) {
    if (!response) return;
    if (response->content) free(response->content);
    free(response);
}

// ============================================================================
// WINDOWS HTTP (WinHTTP)
// ============================================================================

#ifdef _WIN32

static HttpResponse* http_post_windows(const char* url, const char* body, size_t body_len) {
    HINTERNET hSession = NULL;
    HINTERNET hConnect = NULL;
    HINTERNET hRequest = NULL;
    HttpResponse* response = NULL;
    ResponseBuffer* buf = NULL;
    DWORD start_time = GetTickCount();
    
    // Parse URL (assuming http://localhost:11441/api/chat)
    LPCWSTR host = L"localhost";
    INTERNET_PORT port = 11441;
    LPCWSTR path = L"/api/chat";
    
    // Initialize WinHTTP
    hSession = WinHttpOpen(
        L"BigDaddyG/1.0",
        WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
        WINHTTP_NO_PROXY_NAME,
        WINHTTP_NO_PROXY_BYPASS,
        0
    );
    
    if (!hSession) goto cleanup;
    
    // Connect
    hConnect = WinHttpConnect(hSession, host, port, 0);
    if (!hConnect) goto cleanup;
    
    // Create request
    hRequest = WinHttpOpenRequest(
        hConnect,
        L"POST",
        path,
        NULL,
        WINHTTP_NO_REFERER,
        WINHTTP_DEFAULT_ACCEPT_TYPES,
        0
    );
    
    if (!hRequest) goto cleanup;
    
    // Set headers
    LPCWSTR headers = L"Content-Type: application/json\r\n";
    WinHttpAddRequestHeaders(
        hRequest,
        headers,
        (DWORD)-1L,
        WINHTTP_ADDREQ_FLAG_ADD
    );
    
    // Send request
    if (!WinHttpSendRequest(
        hRequest,
        WINHTTP_NO_ADDITIONAL_HEADERS,
        0,
        (LPVOID)body,
        (DWORD)body_len,
        (DWORD)body_len,
        0
    )) {
        goto cleanup;
    }
    
    // Receive response
    if (!WinHttpReceiveResponse(hRequest, NULL)) {
        goto cleanup;
    }
    
    // Get status code
    DWORD status_code = 0;
    DWORD size = sizeof(DWORD);
    WinHttpQueryHeaders(
        hRequest,
        WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
        NULL,
        &status_code,
        &size,
        NULL
    );
    
    // Read response body
    buf = create_buffer();
    if (!buf) goto cleanup;
    
    DWORD bytes_available = 0;
    DWORD bytes_read = 0;
    char buffer[8192];
    
    do {
        bytes_available = 0;
        if (!WinHttpQueryDataAvailable(hRequest, &bytes_available)) {
            break;
        }
        
        if (bytes_available == 0) break;
        
        DWORD to_read = bytes_available < sizeof(buffer) ? bytes_available : sizeof(buffer);
        
        if (!WinHttpReadData(hRequest, buffer, to_read, &bytes_read)) {
            break;
        }
        
        if (bytes_read > 0) {
            append_to_buffer(buf, buffer, bytes_read);
        }
        
    } while (bytes_available > 0);
    
    // Create response object
    response = (HttpResponse*)malloc(sizeof(HttpResponse));
    if (response) {
        response->content = buf->data;
        response->status_code = (int)status_code;
        response->request_time = (GetTickCount() - start_time) / 1000.0;
        response->response_size = buf->size;
        
        // Don't free buf->data since we're using it
        free(buf);
        buf = NULL;
    }
    
cleanup:
    if (buf) free_buffer(buf);
    if (hRequest) WinHttpCloseHandle(hRequest);
    if (hConnect) WinHttpCloseHandle(hConnect);
    if (hSession) WinHttpCloseHandle(hSession);
    
    return response;
}

#else

// ============================================================================
// LINUX/MAC HTTP (libcurl)
// ============================================================================

static size_t curl_write_callback(void* contents, size_t size, size_t nmemb, void* userp) {
    size_t realsize = size * nmemb;
    ResponseBuffer* buf = (ResponseBuffer*)userp;
    
    append_to_buffer(buf, (const char*)contents, realsize);
    return realsize;
}

static HttpResponse* http_post_curl(const char* url, const char* body, size_t body_len) {
    CURL* curl = NULL;
    CURLcode res;
    HttpResponse* response = NULL;
    ResponseBuffer* buf = NULL;
    long status_code = 0;
    double request_time = 0;
    
    curl = curl_easy_init();
    if (!curl) return NULL;
    
    buf = create_buffer();
    if (!buf) {
        curl_easy_cleanup(curl);
        return NULL;
    }
    
    // Set options
    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, body_len);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curl_write_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, buf);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 300L); // 5 minutes
    
    // Set headers
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    
    // Perform request
    res = curl_easy_perform(curl);
    
    if (res == CURLE_OK) {
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status_code);
        curl_easy_getinfo(curl, CURLINFO_TOTAL_TIME, &request_time);
        
        // Create response
        response = (HttpResponse*)malloc(sizeof(HttpResponse));
        if (response) {
            response->content = buf->data;
            response->status_code = (int)status_code;
            response->request_time = request_time;
            response->response_size = buf->size;
            
            // Don't free buf->data
            free(buf);
            buf = NULL;
        }
    }
    
    if (buf) free_buffer(buf);
    if (headers) curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    
    return response;
}

#endif

// ============================================================================
// PUBLIC API
// ============================================================================

static HttpResponse* http_post(const char* url, const char* body) {
    size_t body_len = strlen(body);
    
#ifdef _WIN32
    return http_post_windows(url, body, body_len);
#else
    return http_post_curl(url, body, body_len);
#endif
}

// ============================================================================
// NODE.JS N-API BINDINGS
// ============================================================================

/**
 * Initialize
 */
static napi_value Init(napi_env env, napi_callback_info info) {
    g_initialized = true;
    
    napi_value result;
    napi_get_boolean(env, true, &result);
    return result;
}

/**
 * Generate AI response using native HTTP
 * 
 * JavaScript: nativeOllama.generate(model, prompt)
 * Returns: { content, statusCode, time, size }
 */
static napi_value Generate(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_status status;
    
    status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    if (status != napi_ok || argc < 2) {
        napi_throw_error(env, "INVALID_ARGS", "Expected: model, prompt");
        return NULL;
    }
    
    // Get model
    char model[256];
    size_t model_len;
    napi_get_value_string_utf8(env, args[0], model, 256, &model_len);
    
    // Get prompt
    char* prompt = NULL;
    size_t prompt_len;
    napi_get_value_string_utf8(env, args[1], NULL, 0, &prompt_len);
    prompt = (char*)malloc(prompt_len + 1);
    napi_get_value_string_utf8(env, args[1], prompt, prompt_len + 1, &prompt_len);
    
    // Build JSON request
    char* json_request = (char*)malloc(prompt_len + 512);
    sprintf(json_request, 
        "{\"message\":\"%s\",\"model\":\"%s\",\"parameters\":{}}",
        prompt,
        model
    );
    
    // Make HTTP request
    HttpResponse* response = http_post("http://localhost:11441/api/chat", json_request);
    
    free(prompt);
    free(json_request);
    
    if (!response) {
        napi_throw_error(env, "HTTP_ERROR", "Failed to connect to Ollama");
        return NULL;
    }
    
    // Create JavaScript response
    napi_value result;
    napi_create_object(env, &result);
    
    // Add content
    napi_value content;
    napi_create_string_utf8(env, response->content, NAPI_AUTO_LENGTH, &content);
    napi_set_named_property(env, result, "content", content);
    
    // Add status code
    napi_value code;
    napi_create_int32(env, response->status_code, &code);
    napi_set_named_property(env, result, "statusCode", code);
    
    // Add time
    napi_value time;
    napi_create_double(env, response->request_time, &time);
    napi_set_named_property(env, result, "time", time);
    
    // Add size
    napi_value size;
    napi_create_int64(env, (int64_t)response->response_size, &size);
    napi_set_named_property(env, result, "size", size);
    
    free_http_response(response);
    
    return result;
}

/**
 * Module initialization
 */
static napi_value InitModule(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        { "init", NULL, Init, NULL, NULL, NULL, napi_default, NULL },
        { "generate", NULL, Generate, NULL, NULL, NULL, napi_default, NULL }
    };
    
    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    
    printf("[BigDaddyG Native HTTP] ⚡ Module loaded - Using native HTTP client\n");
    
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, InitModule)

