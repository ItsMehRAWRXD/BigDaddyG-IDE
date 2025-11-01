; =====================================================================
; Professional NASM Build System
; Advanced x86-64 Assembly IDE Integration
; Features: Toolchain Detection, Multiple Build Configurations,
;          Windows API Integration, Professional Development Tools
; =====================================================================

; Build System Constants
%define BUILD_SYSTEM_VERSION        "2.1.0"
%define MAX_PATH_LENGTH             260
%define MAX_COMMAND_LENGTH          1024
%define DEFAULT_STACK_SIZE          0x100000

; Build Configuration Types
%define BUILD_DEBUG                 1
%define BUILD_RELEASE               2
%define BUILD_SMALL                 3
%define BUILD_FAST                  4

; Architecture Types
%define ARCH_X64                    1
%define ARCH_X86                    2
%define ARCH_ARM64                  3

; Toolchain Types
%define TOOLCHAIN_NASM              1
%define TOOLCHAIN_YASM              2
%define TOOLCHAIN_MASM              3
%define TOOLCHAIN_GCC               4

; Windows API Constants
%define STD_INPUT_HANDLE            -10
%define STD_OUTPUT_HANDLE           -11
%define STD_ERROR_HANDLE            -12

%define GENERIC_READ                0x80000000
%define GENERIC_WRITE               0x40000000
%define CREATE_ALWAYS               2
%define FILE_ATTRIBUTE_NORMAL       0x80

%define SW_SHOW                     5
%define SW_HIDE                     0

; Structure Definitions
struc BuildConfig
    .buildType      resd 1      ; BUILD_DEBUG, BUILD_RELEASE, etc.
    .architecture   resd 1      ; ARCH_X64, ARCH_X86, etc.
    .toolchain      resd 1      ; TOOLCHAIN_NASM, etc.
    .outputPath     resb MAX_PATH_LENGTH
    .sourcePath     resb MAX_PATH_LENGTH
    .includePaths   resb MAX_PATH_LENGTH * 5
    .libraryPaths   resb MAX_PATH_LENGTH * 5
    .optimization   resd 1      ; Optimization level (0-3)
    .debugInfo      resd 1      ; Include debug info (0/1)
endstruc

struc ToolchainInfo
    .name           resb 32
    .version        resb 16
    .path           resb MAX_PATH_LENGTH
    .isAvailable    resd 1
    .supportsX64    resd 1
    .supportsX86    resd 1
endstruc

section .data
    ; Build System Information
    buildSystemName     db "Professional NASM Build System", 0
    buildSystemVersion  db BUILD_SYSTEM_VERSION, 0

    ; Default Build Configuration
    defaultConfig:
        istruc BuildConfig
            at BuildConfig.buildType,       dd BUILD_DEBUG
            at BuildConfig.architecture,    dd ARCH_X64
            at BuildConfig.toolchain,       dd TOOLCHAIN_NASM
            at BuildConfig.optimization,    dd 0
            at BuildConfig.debugInfo,       dd 1
        iend

    ; Toolchain Information
    toolchains:
        ; NASM Toolchain
        istruc ToolchainInfo
            at ToolchainInfo.name,          db "NASM", 0
            at ToolchainInfo.version,       db "2.15", 0
            at ToolchainInfo.path,          db "nasm.exe", 0
            at ToolchainInfo.isAvailable,   dd 0
            at ToolchainInfo.supportsX64,   dd 1
            at ToolchainInfo.supportsX86,   dd 1
        iend

        ; YASM Toolchain
        istruc ToolchainInfo
            at ToolchainInfo.name,          db "YASM", 0
            at ToolchainInfo.version,       db "1.3", 0
            at ToolchainInfo.path,          db "yasm.exe", 0
            at ToolchainInfo.isAvailable,   dd 0
            at ToolchainInfo.supportsX64,   dd 1
            at ToolchainInfo.supportsX86,   dd 1
        iend

        ; GCC Toolchain
        istruc ToolchainInfo
            at ToolchainInfo.name,          db "GCC", 0
            at ToolchainInfo.version,       db "11.0", 0
            at ToolchainInfo.path,          db "gcc.exe", 0
            at ToolchainInfo.isAvailable,   dd 0
            at ToolchainInfo.supportsX64,   dd 1
            at ToolchainInfo.supportsX86,   dd 1
        iend

    ; Build Commands
    nasmDebugCmd        db "nasm -g -f win64 -o ", 0
    nasmReleaseCmd      db "nasm -O2 -f win64 -o ", 0
    nasmSmallCmd        db "nasm -Os -f win64 -o ", 0
    nasmFastCmd         db "nasm -O3 -f win64 -o ", 0

    gccDebugCmd         db "gcc -g -o ", 0
    gccReleaseCmd       db "gcc -O2 -s -o ", 0
    gccSmallCmd         db "gcc -Os -s -o ", 0
    gccFastCmd          db "gcc -O3 -o ", 0

    ; Messages
    msgWelcome          db "Professional NASM Build System v", BUILD_SYSTEM_VERSION, 13, 10
                        db "Advanced x86-64 Assembly Development Environment", 13, 10, 0

    msgDetectingTools   db "Detecting available tools...", 13, 10, 0
    msgToolFound        db "  [✓] %s v%s found", 13, 10, 0
    msgToolMissing      db "  [✗] %s not found", 13, 10, 0

    msgBuilding         db "Building project...", 13, 10, 0
    msgBuildSuccess     db "  [✓] Build completed successfully", 13, 10, 0
    msgBuildFailed      db "  [✗] Build failed", 13, 10, 0

    msgCreatingOutput   db "Creating output directory...", 13, 10, 0
    msgOutputCreated    db "  [✓] Output directory created", 13, 10, 0

    ; Error Messages
    errNoSource         db "Error: No source file specified", 13, 10, 0
    errInvalidConfig    db "Error: Invalid build configuration", 13, 10, 0
    errToolNotFound     db "Error: Required tool not found: %s", 13, 10, 0
    errCreateProcess    db "Error: Failed to create build process", 13, 10, 0
    errBuildProcess     db "Error: Build process failed", 13, 10, 0

section .bss
    ; Dynamic Memory
    commandBuffer       resb MAX_COMMAND_LENGTH
    outputPathBuffer    resb MAX_PATH_LENGTH
    sourcePathBuffer    resb MAX_PATH_LENGTH
    currentConfig       resb BuildConfig_size

    ; Process Information
    hProcess            resq 1
    hThread             resq 1
    dwProcessId         resd 1
    dwThreadId          resd 1

    ; Console Information
    hConsole            resq 1
    dwWritten           resd 1

    ; File Handles
    hSourceFile         resq 1
    hOutputFile         resq 1

section .text
    global _start
    extern GetStdHandle
    extern WriteConsoleA
    extern CreateProcessA
    extern WaitForSingleObject
    extern GetExitCodeProcess
    extern CloseHandle
    extern CreateFileA
    extern ReadFile
    extern WriteFile
    extern CreateDirectoryA
    extern GetFileAttributesA
    extern SetFileAttributesA

; =====================================================================
; Main Entry Point
; =====================================================================
_start:
    ; Initialize stack alignment
    and rsp, -16

    ; Save command line arguments
    mov [sourcePathBuffer], rcx     ; argv[0] - executable path
    mov [sourcePathBuffer+8], rdx   ; argv[1] - source file path

    ; Display welcome message
    call DisplayWelcomeMessage

    ; Detect available tools
    call DetectToolchain

    ; Initialize build configuration
    call InitializeBuildConfig

    ; Check command line arguments
    call ParseCommandLine

    ; Perform build
    call ExecuteBuild

    ; Exit
    mov ecx, 0
    call ExitProcess

; =====================================================================
; Display Welcome Message
; =====================================================================
DisplayWelcomeMessage:
    push rbp
    mov rbp, rsp

    ; Get stdout handle
    mov ecx, STD_OUTPUT_HANDLE
    call GetStdHandle
    mov [hConsole], rax

    ; Write welcome message
    mov rcx, [hConsole]
    mov rdx, msgWelcome
    mov r8, 80
    mov r9, dwWritten
    call WriteConsoleA

    pop rbp
    ret

; =====================================================================
; Detect Available Toolchain
; =====================================================================
DetectToolchain:
    push rbp
    mov rbp, rsp

    ; Display detection message
    mov rcx, [hConsole]
    mov rdx, msgDetectingTools
    mov r8, 30
    mov r9, dwWritten
    call WriteConsoleA

    ; Check each toolchain
    mov rsi, toolchains
    mov ecx, 3          ; Number of toolchains

.detect_loop:
    push rcx
    push rsi

    ; Check if tool is available
    call CheckToolAvailability

    ; Display result
    call DisplayToolStatus

    pop rsi
    pop rcx

    add rsi, ToolchainInfo_size
    loop .detect_loop

    pop rbp
    ret

; =====================================================================
; Check Tool Availability
; =====================================================================
CheckToolAvailability:
    push rbp
    mov rbp, rsp

    ; Get tool name
    lea rdi, [rsi + ToolchainInfo.name]

    ; Try to find the executable
    mov rcx, rdi
    call FindExecutable

    test rax, rax
    jz .not_found

    ; Tool found, update info
    mov dword [rsi + ToolchainInfo.isAvailable], 1
    lea rcx, [rsi + ToolchainInfo.path]
    mov [rsi + ToolchainInfo.path], rcx

    ; Get version if possible
    call GetToolVersion

.found:
    pop rbp
    ret

.not_found:
    mov dword [rsi + ToolchainInfo.isAvailable], 0
    pop rbp
    ret

; =====================================================================
; Find Executable in PATH
; =====================================================================
FindExecutable:
    ; This is a simplified implementation
    ; Real implementation would search PATH environment variable

    ; For now, just check if file exists in current directory
    mov rcx, rdi
    call FileExists
    test rax, rax
    jnz .found

    ; Check in common installation directories
    lea rcx, [commonPaths]
    call SearchInCommonPaths

.found:
    ret

commonPaths:
    db "C:\Program Files\NASM\", 0
    db "C:\Program Files (x86)\NASM\", 0
    db "C:\MinGW\bin\", 0
    db "C:\msys64\mingw64\bin\", 0

; =====================================================================
; Initialize Build Configuration
; =====================================================================
InitializeBuildConfig:
    push rbp
    mov rbp, rsp

    ; Copy default configuration
    mov rsi, defaultConfig
    mov rdi, currentConfig
    mov rcx, BuildConfig_size
    rep movsb

    ; Set default output path
    lea rsi, [defaultOutputPath]
    lea rdi, [currentConfig + BuildConfig.outputPath]
    call CopyString

    pop rbp
    ret

defaultOutputPath db "output\build.exe", 0

; =====================================================================
; Parse Command Line Arguments
; =====================================================================
ParseCommandLine:
    push rbp
    mov rbp, rsp

    ; Check for source file argument
    mov rcx, [sourcePathBuffer+8]  ; argv[1]
    test rcx, rcx
    jz .no_source

    ; Validate source file
    call ValidateSourceFile
    test rax, rax
    jz .invalid_source

    ; Set source path
    lea rdi, [currentConfig + BuildConfig.sourcePath]
    call CopyString

    pop rbp
    ret

.no_source:
    ; Display error and exit
    mov rcx, [hConsole]
    mov rdx, errNoSource
    mov r8, 35
    mov r9, dwWritten
    call WriteConsoleA

    mov ecx, 1
    call ExitProcess

.invalid_source:
    ; Display error and exit
    mov rcx, [hConsole]
    mov rdx, errInvalidSource
    mov r8, 25
    mov r9, dwWritten
    call WriteConsoleA

    mov ecx, 1
    call ExitProcess

; =====================================================================
; Execute Build Process
; =====================================================================
ExecuteBuild:
    push rbp
    mov rbp, rsp

    ; Display building message
    mov rcx, [hConsole]
    mov rdx, msgBuilding
    mov r8, 20
    mov r9, dwWritten
    call WriteConsoleA

    ; Create output directory
    call CreateOutputDirectory

    ; Generate build command
    call GenerateBuildCommand

    ; Execute build
    call ExecuteBuildCommand

    ; Check result
    test rax, rax
    jz .failed

    ; Success
    mov rcx, [hConsole]
    mov rdx, msgBuildSuccess
    mov r8, 35
    mov r9, dwWritten
    call WriteConsoleA

    pop rbp
    ret

.failed:
    ; Failed
    mov rcx, [hConsole]
    mov rdx, msgBuildFailed
    mov r8, 20
    mov r9, dwWritten
    call WriteConsoleA

    mov ecx, 1
    call ExitProcess

; =====================================================================
; Generate Build Command
; =====================================================================
GenerateBuildCommand:
    push rbp
    mov rbp, rsp

    ; Clear command buffer
    lea rdi, [commandBuffer]
    mov rcx, MAX_COMMAND_LENGTH
    xor rax, rax
    rep stosb

    ; Get build type
    mov eax, [currentConfig + BuildConfig.buildType]

    ; Generate assembler command
    cmp eax, BUILD_DEBUG
    je .debug_build
    cmp eax, BUILD_RELEASE
    je .release_build
    cmp eax, BUILD_SMALL
    je .small_build
    cmp eax, BUILD_FAST
    je .fast_build

    ; Default to debug
.debug_build:
    lea rsi, [nasmDebugCmd]
    jmp .assemble

.release_build:
    lea rsi, [nasmReleaseCmd]
    jmp .assemble

.small_build:
    lea rsi, [nasmSmallCmd]
    jmp .assemble

.fast_build:
    lea rsi, [nasmFastCmd]

.assemble:
    ; Copy assembler command
    lea rdi, [commandBuffer]
    call CopyString

    ; Add source file
    lea rsi, [currentConfig + BuildConfig.sourcePath]
    call AppendString

    ; Add space and -o flag
    mov byte [rdi], ' '
    inc rdi
    mov word [rdi], '-o'
    add rdi, 2
    mov byte [rdi], ' '
    inc rdi

    ; Add object file path
    lea rsi, [currentConfig + BuildConfig.outputPath]
    lea rdx, [rsi]
    dec rdx  ; Remove .exe extension
    dec rdx
    dec rdx
    dec rdx
    mov word [rdx], '.o'
    add rdx, 2
    mov byte [rdx], 'b'
    add rdx, 1
    mov byte [rdx], 'j'
    add rdx, 1
    mov byte [rdx], 0

    lea rsi, [currentConfig + BuildConfig.outputPath]
    call AppendString

    ; Add linker command (simplified)
    lea rsi, [gccDebugCmd]
    call AppendString

    lea rsi, [currentConfig + BuildConfig.outputPath]
    call AppendString

    lea rsi, [linkLibraries]
    call AppendString

    pop rbp
    ret

linkLibraries db " -lkernel32 -luser32", 0

; =====================================================================
; Execute Build Command
; =====================================================================
ExecuteBuildCommand:
    push rbp
    mov rbp, rsp

    ; Prepare process information structures
    sub rsp, 104  ; Space for structures

    ; Zero initialize structures
    xor rax, rax
    lea rdi, [rsp]
    mov rcx, 26   ; 104 / 4
    rep stosd

    ; Set up STARTUPINFO
    mov dword [rsp + 0], 104  ; cb
    mov qword [rsp + 8], 0    ; lpReserved
    mov qword [rsp + 16], 0   ; lpDesktop
    mov qword [rsp + 24], 0   ; lpTitle
    mov dword [rsp + 32], 0   ; dwX
    mov dword [rsp + 36], 0   ; dwY
    mov dword [rsp + 40], 0   ; dwXSize
    mov dword [rsp + 44], 0   ; dwYSize
    mov dword [rsp + 48], 0   ; dwXCountChars
    mov dword [rsp + 52], 0   ; dwYCountChars
    mov dword [rsp + 56], 0   ; dwFillAttribute
    mov dword [rsp + 60], 0   ; dwFlags
    mov word [rsp + 64], 0    ; wShowWindow
    mov word [rsp + 66], 0    ; cbReserved2
    mov qword [rsp + 72], 0   ; lpReserved2
    mov qword [rsp + 80], 0   ; hStdInput
    mov qword [rsp + 88], 0   ; hStdOutput
    mov qword [rsp + 96], 0   ; hStdError

    ; Create command line string
    lea rcx, [commandBuffer]
    call CreateCommandLine

    ; Call CreateProcessA
    lea rcx, [nullString]     ; lpApplicationName
    mov rdx, rax              ; lpCommandLine
    mov r8, 0                 ; lpProcessAttributes
    mov r9, 0                 ; lpThreadAttributes
    mov dword [rsp + 32], 0   ; bInheritHandles
    mov dword [rsp + 40], 0   ; dwCreationFlags
    mov qword [rsp + 48], 0   ; lpEnvironment
    lea r10, [currentDir]     ; lpCurrentDirectory
    lea r11, [rsp]            ; lpStartupInfo
    mov qword [rsp + 64], 0   ; lpProcessInformation

    call CreateProcessA

    test rax, rax
    jz .create_failed

    ; Get process handle
    mov rax, [rsp + 64]
    mov [hProcess], rax

    ; Wait for completion
    mov rcx, [hProcess]
    mov rdx, 0xFFFFFFFF  ; INFINITE
    call WaitForSingleObject

    ; Get exit code
    mov rcx, [hProcess]
    lea rdx, [exitCode]
    call GetExitCodeProcess

    ; Close handles
    mov rcx, [hProcess]
    call CloseHandle

    mov rcx, [hThread]
    call CloseHandle

    ; Check exit code
    mov eax, [exitCode]
    test eax, eax
    jz .success

    mov eax, 0
    jmp .done

.create_failed:
    mov rcx, [hConsole]
    mov rdx, errCreateProcess
    mov r8, 35
    mov r9, dwWritten
    call WriteConsoleA

    mov eax, 0
    jmp .done

.success:
    mov eax, 1

.done:
    add rsp, 104  ; Clean up stack
    pop rbp
    ret

nullString db 0
currentDir db ".", 0
exitCode   dd 0

; =====================================================================
; Utility Functions
; =====================================================================

; Copy null-terminated string
CopyString:
    push rsi
    push rdi

.copy_loop:
    mov al, [rsi]
    test al, al
    jz .done
    mov [rdi], al
    inc rsi
    inc rdi
    jmp .copy_loop

.done:
    pop rdi
    pop rsi
    ret

; Append string to buffer
AppendString:
    push rsi
    push rdi

    ; Find end of destination
.find_end:
    cmp byte [rdi], 0
    je .copy
    inc rdi
    jmp .find_end

.copy:
    call CopyString

    pop rdi
    pop rsi
    ret

; Create command line with proper quoting
CreateCommandLine:
    ; Simplified implementation
    ret

; Validate source file exists and is .asm
ValidateSourceFile:
    push rbp
    mov rbp, rsp

    ; Check if file exists
    call FileExists
    test rax, rax
    jz .invalid

    ; Check file extension
    call GetFileExtension
    lea rsi, [asmExtension]
    call CompareStrings
    test rax, rax
    jz .invalid

    mov eax, 1
    jmp .done

.invalid:
    xor eax, eax

.done:
    pop rbp
    ret

asmExtension db ".asm", 0

; Get file extension
GetFileExtension:
    ; Find last dot in filename
    mov rsi, rcx
    mov rdi, rsi

.find_dot:
    mov al, [rsi]
    test al, al
    jz .no_extension
    cmp al, '.'
    je .found_dot
    inc rsi
    jmp .find_dot

.found_dot:
    lea rax, [rsi + 1]
    ret

.no_extension:
    xor rax, rax
    ret

; Compare strings
CompareStrings:
    push rsi
    push rdi

.compare:
    mov al, [rsi]
    mov bl, [rdi]
    cmp al, bl
    jne .different
    test al, al
    jz .same
    inc rsi
    inc rdi
    jmp .compare

.different:
    xor rax, rax
    jmp .done

.same:
    mov eax, 1

.done:
    pop rdi
    pop rsi
    ret

; Check if file exists
FileExists:
    push rbp
    mov rbp, rsp

    ; Call GetFileAttributesA
    call GetFileAttributesA

    ; Check if valid handle (not INVALID_FILE_ATTRIBUTES)
    cmp rax, 0xFFFFFFFF
    je .not_exists

    mov eax, 1
    jmp .done

.not_exists:
    xor eax, eax

.done:
    pop rbp
    ret

; Create output directory
CreateOutputDirectory:
    push rbp
    mov rbp, rsp

    ; Display message
    mov rcx, [hConsole]
    mov rdx, msgCreatingOutput
    mov r8, 30
    mov r9, dwWritten
    call WriteConsoleA

    ; Extract directory from output path
    lea rsi, [currentConfig + BuildConfig.outputPath]
    lea rdi, [outputPathBuffer]

.extract_dir:
    mov al, [rsi]
    test al, al
    jz .create_dir
    cmp al, '\'
    je .found_separator
    cmp al, '/'
    je .found_separator
    mov [rdi], al
    inc rsi
    inc rdi
    jmp .extract_dir

.found_separator:
    mov byte [rdi], 0
    lea rsi, [outputPathBuffer]
    jmp .create_dir

.create_dir:
    lea rsi, [outputPathBuffer]

    ; Call CreateDirectoryA
    xor rcx, rcx  ; lpSecurityAttributes
    mov rdx, rsi ; lpPathName
    call CreateDirectoryA

    test rax, rax
    jz .failed

    ; Success
    mov rcx, [hConsole]
    mov rdx, msgOutputCreated
    mov r8, 30
    mov r9, dwWritten
    call WriteConsoleA

    mov eax, 1
    jmp .done

.failed:
    xor eax, eax

.done:
    pop rbp
    ret

; Display tool status
DisplayToolStatus:
    push rbp
    mov rbp, rsp

    ; Check if tool is available
    mov eax, [rsi + ToolchainInfo.isAvailable]
    test eax, eax
    jz .missing

    ; Tool found
    mov rcx, [hConsole]
    lea rdx, [msgToolFound]
    mov r8, 20
    mov r9, dwWritten

    ; Get tool name
    lea r10, [rsi + ToolchainInfo.name]
    ; Get tool version
    lea r11, [rsi + ToolchainInfo.version]

    call WriteConsoleA
    jmp .done

.missing:
    ; Tool missing
    mov rcx, [hConsole]
    lea rdx, [msgToolMissing]
    mov r8, 20
    mov r9, dwWritten

    ; Get tool name
    lea r10, [rsi + ToolchainInfo.name]

    call WriteConsoleA

.done:
    pop rbp
    ret

; Get tool version
GetToolVersion:
    ; This would execute the tool with --version and parse output
    ; Simplified implementation
    ret

; Search in common paths
SearchInCommonPaths:
    ; Simplified implementation
    ret

; =====================================================================
; Exit Process (imported from kernel32.dll)
; =====================================================================
extern ExitProcess