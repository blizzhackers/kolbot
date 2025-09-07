function Copy-IfNotExists {
    param (
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )
    if (Test-Path $Source) {
        if (-not (Test-Path $Destination)) {
            Copy-Item $Source $Destination -Force
            Write-Host "Copied $Description"
        } else {
            Write-Host "$Description already exists - skipping"
        }
    } else {
        Write-Host "WARNING: Source file $Source not found - skipping $Description"
    }
}

Write-Host "Copying setup files to their respective directories..."
Write-Host "Current directory: $PWD"
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "WARNING: Git is not installed or not available in PATH"
    Write-Host "Please install Git and ensure it's in your PATH to use submodules"
    Write-Host "Continuing with file copying only..."
    Write-Host ""
} else {
    Write-Host "Git detected, initializing and updating submodules..."
    git submodule update --init --recursive
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Failed to update submodules"
        Write-Host "Please check your Git configuration and try again"
        Write-Host ""
    } else {
        Write-Host "Submodules updated successfully!"
        Write-Host ""
    }
}

# Set base directories
$SETUP_DIR = "+setup"
$DATA_DIR = "data"
$LOGS_DIR = "logs"
$D2BS_DIR = "d2bs"
$STARTER_DIR = "d2bs\kolbot\libs\starter"
$SYSTEMS_DIR = "d2bs\kolbot\libs\systems"
$CONFIG_DIR = "d2bs\kolbot\libs\config"
$SOLOPLAY_DIR = "d2bs\kolbot\libs\SoloPlay"
$SOLOPLAY_SETUP_DIR = "$SOLOPLAY_DIR\+setup"
$SOLOPLAY_SETTINGS_DIR = "$SOLOPLAY_DIR\Settings"
$SOLOPLAY_OOG_DIR = "$SOLOPLAY_DIR\OOG"

# Create directories if they don't exist
$dirs = @(
    $DATA_DIR,
    $LOGS_DIR,
    $D2BS_DIR,
    $STARTER_DIR,
    "$SYSTEMS_DIR\automule\config",
    "$SYSTEMS_DIR\channel",
    "$SYSTEMS_DIR\cleaner",
    "$SYSTEMS_DIR\crafting",
    "$SYSTEMS_DIR\follow",
    "$SYSTEMS_DIR\gambling",
    "$SYSTEMS_DIR\gameaction",
    "$SYSTEMS_DIR\mulelogger",
    "$SYSTEMS_DIR\pubjoin",
    "$SYSTEMS_DIR\torch",
    "$SYSTEMS_DIR\charrefresher"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

# Copy JSON files to data directory
Write-Host "Copying JSON files to data directory..."
Copy-IfNotExists "$SETUP_DIR\data\cdkeys.json" "$DATA_DIR\cdkeys.json" "cdkeys.json to data directory"
Copy-IfNotExists "$SETUP_DIR\data\patch.json" "$DATA_DIR\patch.json" "patch.json to data directory"
Copy-IfNotExists "$SETUP_DIR\data\profile.json" "$DATA_DIR\profile.json" "profile.json to data directory"
Copy-IfNotExists "$SETUP_DIR\data\schedules.json" "$DATA_DIR\schedules.json" "schedules.json to data directory"
Copy-IfNotExists "$SETUP_DIR\data\server.json" "$DATA_DIR\server.json" "server.json to data directory"
Write-Host "JSON files processed successfully!"
Write-Host ""

# Copy log files to logs directory
Write-Host "Copying log files to logs directory..."
Copy-IfNotExists "$SETUP_DIR\logs\Console.rtf" "$LOGS_DIR\Console.rtf" "Console.rtf to logs directory"
Copy-IfNotExists "$SETUP_DIR\logs\exceptions.log" "$LOGS_DIR\exceptions.log" "exceptions.log to logs directory"
Copy-IfNotExists "$SETUP_DIR\logs\keyinfo.log" "$LOGS_DIR\keyinfo.log" "keyinfo.log to logs directory"
Write-Host "Log files processed successfully!"
Write-Host ""

# Copy ini file to d2bs directory
Write-Host "Copying d2bs.ini to d2bs directory..."
Copy-IfNotExists "$SETUP_DIR\d2bs.ini" "$D2BS_DIR\d2bs.ini" "d2bs.ini to d2bs directory"
Write-Host ""

# Copy system files to their respective directories
Write-Host "Copying system configuration files..."
Copy-IfNotExists "$SETUP_DIR\automule\MuleConfig.js" "$SYSTEMS_DIR\automule\config\MuleConfig.js" "MuleConfig.js to automule config directory"
Copy-IfNotExists "$SETUP_DIR\automule\TorchAnniMules.js" "$SYSTEMS_DIR\automule\config\TorchAnniMules.js" "TorchAnniMules.js to automule config directory"
Copy-IfNotExists "$SETUP_DIR\automule\StarterConfig.js" "$SYSTEMS_DIR\automule\config\StarterConfig.js" "StarterConfig.js to automule config directory"
Copy-IfNotExists "$SETUP_DIR\channel\ChannelConfig.js" "$SYSTEMS_DIR\channel\ChannelConfig.js" "ChannelConfig.js to channel directory"
Copy-IfNotExists "$SETUP_DIR\cleaner\CleanerConfig.js" "$SYSTEMS_DIR\cleaner\CleanerConfig.js" "CleanerConfig.js to cleaner directory"
Copy-IfNotExists "$SETUP_DIR\crafting\TeamsConfig.js" "$SYSTEMS_DIR\crafting\TeamsConfig.js" "TeamsConfig.js to crafting directory"
Copy-IfNotExists "$SETUP_DIR\follow\FollowConfig.js" "$SYSTEMS_DIR\follow\FollowConfig.js" "FollowConfig.js to follow directory"
Copy-IfNotExists "$SETUP_DIR\gambling\TeamsConfig.js" "$SYSTEMS_DIR\gambling\TeamsConfig.js" "TeamsConfig.js to gambling directory"
Copy-IfNotExists "$SETUP_DIR\gameaction\GameActionConfig.js" "$SYSTEMS_DIR\gameaction\GameActionConfig.js" "GameActionConfig.js to gameaction directory"
Copy-IfNotExists "$SETUP_DIR\mulelogger\LoggerConfig.js" "$SYSTEMS_DIR\mulelogger\LoggerConfig.js" "LoggerConfig.js to mulelogger directory"
Copy-IfNotExists "$SETUP_DIR\pubjoin\PubJoinConfig.js" "$SYSTEMS_DIR\pubjoin\PubJoinConfig.js" "PubJoinConfig.js to pubjoin directory"
Copy-IfNotExists "$SETUP_DIR\torch\FarmerConfig.js" "$SYSTEMS_DIR\torch\FarmerConfig.js" "FarmerConfig.js to torch directory"
Copy-IfNotExists "$SETUP_DIR\charrefresher\RefresherConfig.js" "$SYSTEMS_DIR\charrefresher\RefresherConfig.js" "RefresherConfig.js to charrefresher directory"
Write-Host "System configuration files processed successfully!"
Write-Host ""

# Copy custom config files to their respective directories
Write-Host "Copying custom configuration files..."
Copy-IfNotExists "$SETUP_DIR\config\_CustomConfig.js" "$CONFIG_DIR\_CustomConfig.js" "_CustomConfig.js to config directory"
Write-Host ""

# Copy starter config files to their respective directories
Write-Host "Copying starter configuration files..."
Copy-IfNotExists "$SETUP_DIR\starter\AdvancedConfig.js" "$STARTER_DIR\AdvancedConfig.js" "AdvancedConfig.js to starter directory"
Copy-IfNotExists "$SETUP_DIR\starter\StarterConfig.js" "$STARTER_DIR\StarterConfig.js" "StarterConfig.js to starter directory"
Write-Host ""

# Copy SoloPlay setup files to their respective directories
Write-Host "Copying SoloPlay configuration files..."
Copy-IfNotExists "$SOLOPLAY_SETUP_DIR\Settings.js" "$SOLOPLAY_SETTINGS_DIR\Settings.js" "Settings.js to SoloPlay Settings directory"
Copy-IfNotExists "$SOLOPLAY_SETUP_DIR\AdvancedSettings.js" "$SOLOPLAY_SETTINGS_DIR\AdvancedSettings.js" "AdvancedSettings.js to SoloPlay Settings directory"
Copy-IfNotExists "$SOLOPLAY_SETUP_DIR\StarterConfig.js" "$SOLOPLAY_OOG_DIR\StarterConfig.js" "StarterConfig.js to SoloPlay OOG directory"
Write-Host ""

Write-Host "Setup files copied"