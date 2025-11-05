@{
    RootModule = 'OpenMemory.psm1'
    ModuleVersion = '1.0.0'
    GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    Author = 'BigDaddyG'
    CompanyName = 'RawrZ Security'
    Copyright = '(c) 2025 RawrZ Security. All rights reserved.'
    Description = 'PowerShell-native cognitive memory system with vector embeddings, decay management, and local API'
    PowerShellVersion = '5.1'
    
    FunctionsToExport = @(
        'Initialize-OpenMemory',
        'Stop-OpenMemory',
        'Add-OMMemory',
        'Get-OMMemory',
        'Remove-OMMemory',
        'Get-OMUserSummary',
        'Update-OMUserSummary',
        'Clear-OMStorage',
        'Get-OMEmbedding',
        'Get-OMCosineSimilarity',
        'Search-OMMemory',
        'Get-OMContextWindow',
        'Start-OMDecayJob',
        'Stop-OMDecayJob',
        'Invoke-OMDecay',
        'Start-OMHttpAPI',
        'Stop-OMHttpAPI',
        'Update-OMConfig'
    )
    
    CmdletsToExport = @()
    VariablesToExport = @()
    AliasesToExport = @()
    
    PrivateData = @{
        PSData = @{
            Tags = @('Memory', 'AI', 'Embeddings', 'Cognitive', 'LocalFirst')
            LicenseUri = 'https://github.com/ItsMehRAWRXD/BigDaddyG-IDE'
            ProjectUri = 'https://github.com/ItsMehRAWRXD/BigDaddyG-IDE'
            IconUri = ''
            ReleaseNotes = 'Initial release of OpenMemory PowerShell module'
        }
    }
}

