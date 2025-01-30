// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';
/**
 * @author umair.ali
 * @since 30-JAN-2025
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('deepseek-vs-code-extension.deepseek', () => {


		const panel = vscode.window.createWebviewPanel(
			'DeepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage(async (message: any) => {
			if (message.command === 'chat') {
				const userprompt = message.text;
				let responseText = '';

				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:1.5b',
						messages: [{ role: 'user', content: userprompt }],
						stream: true
					});

					for await (const part of streamResponse) {
						responseText += part.message.content;
						panel.webview.postMessage({ command: 'chatResponse', text: responseText });
					}
				} catch (error) {
					panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(error)}` });
				}
			}
		});

	});

	context.subscriptions.push(disposable);
}


function getWebviewContent(): string {
	return /*HTML*/`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <h2>Deep Seek VS Code Extension</h2>
    <textarea name="prompt" id="prompt" rows="3" placeholder="Ask Something........"></textarea>
    <button id="askBtn">Ask</button>
    <div id="response" style="color:white"></div>
	<script>
		const vscode = acquireVsCodeApi();

		document.getElementById('askBtn').addEventListener('click',()=>{
			console.log("Button clicked!");
			console.log("Button clicked!");
			console.log("Button clicked!");
			console.log("Button clicked!");
			const text = document.getElementById('prompt').value;
			vscode.postMessage({command:'chat',text});
		});

		window.addEventListener('message',event => {
			const {command,text} = event.data;
			if(command === 'chatResponse'){
				document.getElementById('response').innerText = text;
			}
		});

	</script>
</body>

</html>

`;
}

// This method is called when your extension is deactivated
export function deactivate() { }
