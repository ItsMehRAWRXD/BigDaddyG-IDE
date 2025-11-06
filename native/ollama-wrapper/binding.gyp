{
  "targets": [
    {
      "target_name": "bigdaddyg_ollama",
      "sources": [
        "bigdaddyg-ollama.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "cflags": [
        "-Wall",
        "-O3"
      ],
      "conditions": [
        [
          "OS=='win'",
          {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1,
                "Optimization": 3,
                "WholeProgramOptimization": "true"
              }
            }
          }
        ],
        [
          "OS=='mac'",
          {
            "xcode_settings": {
              "GCC_OPTIMIZATION_LEVEL": "3",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "CLANG_CXX_LIBRARY": "libc++",
              "MACOSX_DEPLOYMENT_TARGET": "10.15"
            }
          }
        ],
        [
          "OS=='linux'",
          {
            "cflags": [
              "-fPIC",
              "-O3"
            ],
            "ldflags": [
              "-Wl,-rpath,'$$ORIGIN'"
            ]
          }
        ]
      ]
    }
  ]
}

