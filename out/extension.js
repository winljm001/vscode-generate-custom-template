"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const configFileName = "generate-config.json";
const configPath = path.normalize(vscode.workspace.rootPath + "/" + configFileName);
const parserMap = {
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
    }
    catch (error) {
        console.log("error", error);
    }
    return res;
}
function buildFiles(templatePath, targetPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const tempJson = require(`${templatePath}/index.json`);
        const tempArgs = {};
        for (let i = 0; i < tempJson.argument.length; i++) {
            const arg = tempJson.argument[i];
            const nameVal = yield vscode.window.showInputBox({
                placeHolder: arg.message,
            });
            tempArgs[arg === null || arg === void 0 ? void 0 : arg.name] = nameVal;
        }
        // 格式化
        const prettier = require("prettier");
        const prettierrc = require(`${vscode.workspace.rootPath}/.prettierrc.js`) || {};
        tempJson.files.forEach((item) => {
            let content = fs.readFileSync(`${templatePath}/${item.template}`, "utf-8");
            for (const tempKey in tempArgs) {
                // 正则替换变量
                const reg = new RegExp("\\${" + tempKey + "}", "gm");
                content = content.replace(reg, tempArgs[tempKey]);
            }
            // 格式化
            content = prettier.format(content, Object.assign(Object.assign({}, prettierrc), { parser: parserMap[item.extname] }));
            // 获取文件名来生成文件
            var path = require("path");
            var extension = path.extname(`${templatePath}/${item.template}`);
            var file = path.basename(`${templatePath}/${item.template}`, extension);
            const targetFile = `${targetPath}/${item.path}${file}.${item.extname}`;
            fs.access(targetFile, fs.constants.F_OK, (err) => {
                // 没有文件才创建
                if (err) {
                    fs.mkdir(`${targetPath}/${item.path}`, { recursive: true }, (err) => {
                        if (!err) {
                            fs.writeFileSync(targetFile, content);
                        }
                    });
                }
            });
        });
        vscode.window.showInformationMessage("生成成功!");
    });
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let disposable = vscode.commands.registerCommand("generate-custom-template.createTemplate", (uri) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (uri) {
                const config = readConfig();
                let templateFilePath = "";
                if (config && (config === null || config === void 0 ? void 0 : config.templatePath)) {
                    templateFilePath = config === null || config === void 0 ? void 0 : config.templatePath;
                }
                else {
                    const path = yield vscode.window.showOpenDialog({
                        canSelectFolders: true,
                        canSelectFiles: false,
                        canSelectMany: false,
                        title: "选择模板文件夹",
                    });
                    if (path && (path === null || path === void 0 ? void 0 : path.length) > 0) {
                        templateFilePath = (_a = path[0]) === null || _a === void 0 ? void 0 : _a.path;
                        // 不知道为啥获取的路径上多了个/，环境为win
                        templateFilePath =
                            templateFilePath[0] === "/"
                                ? templateFilePath === null || templateFilePath === void 0 ? void 0 : templateFilePath.slice(1) : templateFilePath;
                    }
                    else {
                        vscode.window.showInformationMessage(`请选择模板文件夹，用来生成文件`);
                    }
                    fs.writeFileSync(configPath, `{"templatePath":"${templateFilePath}"}`);
                }
                const allTemplatePath = path.normalize(path.isAbsolute(templateFilePath)
                    ? templateFilePath
                    : vscode.workspace.rootPath + "/" + templateFilePath);
                const allTemplate = fs.readdirSync(allTemplatePath) || [];
                if (allTemplate.length <= 0) {
                    vscode.window.showInformationMessage("模板文件夹内没东西，请创建后重试");
                }
                let pickItems = allTemplate.map((v) => ({
                    label: v,
                    description: v,
                }));
                vscode.window.showQuickPick(pickItems).then((selection) => {
                    // the user canceled the selection
                    if (!selection) {
                        return;
                    }
                    buildFiles(allTemplatePath + "/" + selection.label, dirPath);
                });
                let dirPath = uri.fsPath;
            }
            else {
                vscode.window.showInformationMessage(`无法获取文件夹路径`);
            }
        }
        catch (error) {
            console.log(error);
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map