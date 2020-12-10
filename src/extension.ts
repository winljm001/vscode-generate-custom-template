// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { throws } from "assert";
import * as vscode from "vscode";
const fs = require("fs");
const path = require("path");
const configFileName = "generate-config.json";
const configPath = path.normalize(
  vscode.workspace.rootPath + "/" + configFileName
);
const parserMap: any = {
  ts: "typescript",
  tsx: "typescript",
  less: "less",
  scss: "scss",
  vue: "vue",
  css: "css",
};
// 读取配置文件，如果没有返回false
function readConfig() {
  let res = null;
  try {
    res = JSON.parse(fs.readFileSync(configPath, "utf-8")) || false;
  } catch (error) {
    console.log("error", error);
  }
  return res;
}

async function buildFiles(templatePath: any, targetPath: any) {
  const tempJson = require(`${templatePath}/index.json`);
  const tempArgs: any = {};
  for (let i = 0; i < tempJson.argument.length; i++) {
    const arg: { message: string; name: string } = tempJson.argument[i];
    const nameVal = await vscode.window.showInputBox({
      placeHolder: arg.message,
    });
    tempArgs[arg?.name] = nameVal;
  }
  // 格式化
  const prettier = require("prettier");
  const prettierrc =
    require(`${vscode.workspace.rootPath}/.prettierrc.js`) || {};
  tempJson.files.forEach((item: any) => {
    let content = fs.readFileSync(`${templatePath}/${item.template}`, "utf-8");
    for (const tempKey in tempArgs) {
      // 正则替换变量
      const reg = new RegExp("\\${" + tempKey + "}", "gm");
      content = content.replace(reg, tempArgs[tempKey]);
    }
    // 格式化
    content = prettier.format(content, {
      ...prettierrc,
      parser: parserMap[item.extname],
    });
    // 获取文件名来生成文件
    var path = require("path");
    var extension = path.extname(`${templatePath}/${item.template}`);
    var file = path.basename(`${templatePath}/${item.template}`, extension);
    const targetFile = `${targetPath}/${item.path}${file}.${item.extname}`;
    fs.access(targetFile, fs.constants.F_OK, (err: any) => {
      // 没有文件才创建
      if (err) {
        fs.mkdir(
          `${targetPath}/${item.path}`,
          { recursive: true },
          (err: any) => {
            if (!err) {
              fs.writeFileSync(targetFile, content);
            }
          }
        );
      }
    });
  });
  vscode.window.showInformationMessage("生成成功!");
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "generate-custom-template.createTemplate",
    async (uri) => {
      try {
        if (uri) {
          const config = readConfig();
          let templateFilePath = "";
          if (config && config?.templatePath) {
            templateFilePath = config?.templatePath;
          } else {
            const path = await vscode.window.showOpenDialog({
              canSelectFolders: true,
              canSelectFiles: false,
              canSelectMany: false,
              title: "选择模板文件夹",
            });
            if (path && path?.length > 0) {
              templateFilePath = path[0]?.path;
              // 不知道为啥获取的路径上多了个/，环境为win
              templateFilePath =
                templateFilePath[0] === "/"
                  ? templateFilePath?.slice(1)
                  : templateFilePath;
            } else {
              vscode.window.showInformationMessage(
                `请选择模板文件夹，用来生成文件`
              );
            }
            fs.writeFileSync(
              configPath,
              `{"templatePath":"${templateFilePath}"}`
            );
          }
          const allTemplatePath = path.normalize(
            path.isAbsolute(templateFilePath)
              ? templateFilePath
              : vscode.workspace.rootPath + "/" + templateFilePath
          );
          const allTemplate = fs.readdirSync(allTemplatePath) || [];

          if (allTemplate.length <= 0) {
            vscode.window.showInformationMessage(
              "模板文件夹内没东西，请创建后重试"
            );
          }
          let pickItems: vscode.QuickPickItem[] = allTemplate.map(
            (v: string) => ({
              label: v,
              description: v,
            })
          );
          vscode.window.showQuickPick(pickItems).then((selection) => {
            // the user canceled the selection
            if (!selection) {
              return;
            }

            buildFiles(allTemplatePath + "/" + selection.label, dirPath);
          });
          let dirPath = uri.fsPath;
        } else {
          vscode.window.showInformationMessage(`无法获取文件夹路径`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
