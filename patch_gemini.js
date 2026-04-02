const fs = require('fs');
const path = require('path');

// Paths from your stack trace and editor context
const pathsFile = '/Users/glennbundy/.nvm/versions/node/v24.12.0/lib/node_modules/@google/gemini-cli/node_modules/@google/gemini-cli-core/dist/src/utils/paths.js';
const atProcFile = '/Users/glennbundy/.nvm/versions/node/v24.12.0/lib/node_modules/@google/gemini-cli/dist/src/ui/hooks/atCommandProcessor.js';

console.log('Applying Gemini CLI fixes...');

// 1. Fix paths.js (robustRealpath error handling)
if (fs.existsSync(pathsFile)) {
    let content = fs.readFileSync(pathsFile, 'utf8');
    // Expand allowed error codes to include ENAMETOOLONG and permission errors
    const oldErrorCheck = "(e.code === 'ENOENT' || e.code === 'EISDIR')";
    const newErrorCheck = "(['ENOENT', 'EISDIR', 'ENAMETOOLONG', 'EACCES', 'EPERM'].includes(e.code))";
    
    const oldLstatCheck = "(lstatError.code === 'ENOENT' || lstatError.code === 'EISDIR')";
    const newLstatCheck = "(['ENOENT', 'EISDIR', 'ENAMETOOLONG', 'EACCES', 'EPERM'].includes(lstatError.code))";

    content = content.replaceAll(oldErrorCheck, newErrorCheck);
    content = content.replaceAll(oldLstatCheck, newLstatCheck);
    
    fs.writeFileSync(pathsFile, content);
    console.log('✅ Patched paths.js');
} else {
    console.error('❌ Could not find paths.js at expected location.');
}

// 2. Fix atCommandProcessor.js (Regex and Permissions)
if (fs.existsSync(atProcFile)) {
    let content = fs.readFileSync(atProcFile, 'utf8');
    
    // Fix Regex: Add positive lookbehind to ensure @ is preceded by whitespace or start of string
    const oldRegex = "new RegExp(`(?<!\\\\\\\\)@${AT_COMMAND_PATH_REGEX_SOURCE}`, 'g')";
    const newRegex = "new RegExp(`(?<=\\\\s|^)(?<!\\\\\\\\)@${AT_COMMAND_PATH_REGEX_SOURCE}`, 'g')";
    
    // Fix checkPermissions: Wrap resolution in try/catch
    const oldPerm = "const resolvedPathName = resolveToRealPath(path.resolve(config.getTargetDir(), pathName));";
    const newPerm = "let resolvedPathName; try { resolvedPathName = resolveToRealPath(path.resolve(config.getTargetDir(), pathName)); } catch (e) { continue; }";

    if (content.includes(oldRegex)) {
        content = content.replace(oldRegex, newRegex);
        console.log('✅ Patched atCommandRegex');
    }
    
    if (content.includes(oldPerm)) {
        content = content.replace(oldPerm, newPerm);
        console.log('✅ Patched checkPermissions safety');
    }
    
    fs.writeFileSync(atProcFile, content);
    console.log('✅ Patched atCommandProcessor.js');
} else {
    console.error('❌ Could not find atCommandProcessor.js at expected location.');
}

console.log('Done! Please restart your Gemini CLI session.');
