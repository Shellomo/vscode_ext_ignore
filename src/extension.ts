import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Command to add a pattern to .gitignore
    let addPattern = vscode.commands.registerCommand('ignorex.addPattern', async () => {
        const pattern = await vscode.window.showInputBox({
            placeHolder: 'Enter pattern to ignore (e.g., *.log)',
            prompt: 'Add pattern to .gitignore'
        });

        if (!pattern) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const gitignorePath = path.join(workspaceFolders[0].uri.fsPath, '.gitignore');

        try {
            const content = fs.existsSync(gitignorePath)
                ? fs.readFileSync(gitignorePath, 'utf8') + '\n' + pattern
                : pattern;

            fs.writeFileSync(gitignorePath, content);
            vscode.window.showInformationMessage(`Added "${pattern}" to .gitignore`);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to update .gitignore');
        }
    });

    // Command to remove a pattern from .gitignore
    let removePattern = vscode.commands.registerCommand('ignorex.removePattern', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const gitignorePath = path.join(workspaceFolders[0].uri.fsPath, '.gitignore');

        if (!fs.existsSync(gitignorePath)) {
            vscode.window.showErrorMessage('.gitignore file not found');
            return;
        }

        const content = fs.readFileSync(gitignorePath, 'utf8');
        const patterns = content.split('\n').filter(line => line.trim() !== '');

        const patternToRemove = await vscode.window.showQuickPick(patterns, {
            placeHolder: 'Select pattern to remove'
        });

        if (!patternToRemove) {
            return;
        }

        try {
            const newContent = patterns
                .filter(pattern => pattern !== patternToRemove)
                .join('\n');

            fs.writeFileSync(gitignorePath, newContent);
            vscode.window.showInformationMessage(`Removed "${patternToRemove}" from .gitignore`);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to update .gitignore');
        }
    });

    // Command to create a new .gitignore file with common templates
    let createGitignore = vscode.commands.registerCommand('ignorex.createGitignore', async () => {
        const templates = [
            'Node.js',
            'Python',
            'Java',
            'C++',
            'Custom'
        ];

        const selected = await vscode.window.showQuickPick(templates, {
            placeHolder: 'Select template for .gitignore'
        });

        if (!selected) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const gitignorePath = path.join(workspaceFolders[0].uri.fsPath, '.gitignore');

        try {
            let content = '';
            switch (selected) {
                case 'Node.js':
                    content = `# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
.env
.env.local
.env.*.local
dist/
coverage/`;
                    break;
                case 'Python':
                    content = `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.env
venv/
ENV/`;
                    break;
                case 'Java':
                    content = `# Java
*.class
*.log
*.ctxt
.mtj.tmp/
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar
hs_err_pid*
.classpath
.project
.settings/
target/`;
                    break;
                case 'C++':
                    content = `# C++
*.d
*.slo
*.lo
*.o
*.obj
*.gch
*.pch
*.so
*.dylib
*.dll
*.mod
*.smod
*.lai
*.la
*.a
*.lib
*.exe
*.out
*.app`;
                    break;
                case 'Custom':
                    const customContent = await vscode.window.showInputBox({
                        placeHolder: 'Enter patterns (one per line)',
                        prompt: 'Create custom .gitignore'
                    });
                    content = customContent || '';
                    break;
            }

            if (fs.existsSync(gitignorePath)) {
                const overwrite = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: '.gitignore already exists. Overwrite?'
                });
                if (overwrite !== 'Yes') {
                    return;
                }
            }

            fs.writeFileSync(gitignorePath, content);
            vscode.window.showInformationMessage('.gitignore file created successfully');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to create .gitignore');
        }
    });

    context.subscriptions.push(addPattern, removePattern, createGitignore);
}

export function deactivate() {}
