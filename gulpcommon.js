//------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
//------------------------------------------------------------

//workaround no support for Visual Studio Online url format
const fs = require("fs");
var utilFilePath = process.cwd() + "\\node_modules\\gitinfo\\dist\\utils.js";
if (fs.existsSync(utilFilePath)) {
    var utilContent = fs.readFileSync(utilFilePath, { "encoding": "utf8" });
    var result = utilContent.replace(/url.length !== 2/g, "url.length < 2");
    fs.writeFileSync(utilFilePath, result, { "encoding": "utf8" });
}

const gitdownIncludeHelper = require("gitdown/dist/helpers/include.js");
const gitdown = require("gitdown");
const path = require("path");
const Q = require("q");
const util = require("util");
const mdUrlExtractor = require("markdown-link-extractor");
const fetch = require("node-fetch");
const findup = require("findup");
const gitPath = findup.sync(process.cwd(), ".git\\HEAD");
const MarkdownContents = require("markdown-contents");
const eol = require("eol");

var self = module.exports = {
    /**
     * Generates gitdown output for all files in the inputDir that have a path that match the fileMatchPattern.
     * the resulting output is written to outputDir.  Does not recurse directories for content.
     */
    processDirectory: function (inputDir, outputDir, fileMatchPattern) {
        const fileRegEx = new RegExp(fileMatchPattern, "i");
        var processFilePromises = [];

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        return Q.ninvoke(fs, "readdir", inputDir)
            .then(function (files) {
                files.forEach(function (file, index, array) {
                    if (fileRegEx.exec(file)) {
                        processFilePromises.push(self.processFile(path.resolve(inputDir, file), path.resolve(outputDir), { headingNesting: { enabled: false } }));
                    }
                });
            }).then(function () {
                return Q.allSettled(processFilePromises)
            });
    },
    /**
     * Processes the inputFile using gitdown and the custom include-section gitdown helper using the specified gitdown config.  
     * Resulting output is written to outDir
     */
    processFile: function (inputFile, outDir, config, relativeLinkToHash) {
        console.log("processing: " + inputFile);
        var gd = gitdown.readFile(path.resolve(inputFile));
        config.gitinfo = config.gitinfo || { gitPath: gitPath };
        gd.setConfig(config);

        //register a custom helper that injects h1 anchor tags per document
        gd.registerHelper('include-file', {
            weight: 20,
            compile: !!relativeLinkToHash ? self.includeFile : gitdownIncludeHelper.compile
        });

        //register custom helper include-section to inject sections from a file into the docs
        gd.registerHelper('include-section', {
            weight: 10,
            compile: self.includeSection
        });

        gd.registerHelper('include-headings', {
            weight: 30,
            compile: self.includeHeadings
        });

        var outputFile = path.resolve(outDir, path.basename(inputFile));

        // Write the file ourselves intead of using gitdown.WriteFile so we can fix line endings to be CRLF.
        return gd.get().then((outputString) => {
            var outputStringFixedLineEndings = eol.crlf(outputString);
            return fs.writeFileSync(outputFile, outputStringFixedLineEndings);
        });
    },
    includeHeadings: function (config, context) {
        if (!config.file) {
            throw new Error('config.file must be provided');
        }
        try {
            config.maxLevel = config.maxLevel || 2;

            var fullFilePath = path.resolve(context.gitdown.getConfig().baseDirectory, config.file);
            var relativeFilePath = fullFilePath.replace(context.gitdown.getConfig().baseDirectory, "");

            if (!fs.existsSync(fullFilePath)) {
                throw new Error('Input file does not exist: ' + config.file);
            }

            var content = fs.readFileSync(fullFilePath, {
                encoding: 'utf8'
            });

            var tree = MarkdownContents(content).tree();

            // Set the max level
            tree = self.maxLevel(tree, config.maxLevel);

            var output = MarkdownContents.treeToMarkdown(tree);

            output = self.appendFilepathsToLinks(output, relativeFilePath);
        } catch (err) {
            console.log("An error occured while trying to include headings: " + err);
        }

        return output;
    },
    /**
     * Appends the given filepath to links in the given markdown file that don't already have links setup.
     * Used for fixing up links to point to external files when using the custom "include-headings" gitdown helper
     * @private
     */
    appendFilepathsToLinks: function (markdown, filePath) {
        if (filePath.startsWith('\\')) {
            filePath = filePath.substring(1, filePath.length);
        }
        var regex = new RegExp(']\\(#', 'g');
        markdown = markdown.replace(regex, '](' + filePath + '#');
        return markdown;
    },
    /**
     * Removes tree descendants with level greater than maxLevel.
     * Copied from gitdown's contents.js helper file since their implementation is private
     *
     * @private
     */
    maxLevel: function (tree) {
        var maxLevel = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

        tree.forEach((article, index) => {
            if (article.level > maxLevel) {
                delete tree[index];
            } else {
                article.descendants = self.maxLevel(article.descendants, maxLevel);
            }
        });

        return tree;
    },
    /**
     * Extending gitdown to provide code snippet injection. 
     * The code snippet snippet section with label config.section from within config.file will be extracted
     * and injected into the reference document
     */
    includeSection: function (config, context) {
        if (!config.file) {
            throw new Error('config.file must be provided');
        }

        if (!config.section) {
            throw new Error('config.section must be provided');
        }

        config.file = path.resolve(context.gitdown.getConfig().baseDirectory, config.file);

        if (!fs.existsSync(config.file)) {
            throw new Error('Input file does not exist: ' + config.file);
        }

        var content = fs.readFileSync(config.file, {
            encoding: 'utf8'
        });

        const xmlCommentRegEx = "<!--[ ]?%s[ ]?-->([^]+?)<!--[ ]%s[ ]-->";
        const codeCommentRegEx = "\\/\\/[ ]?%s([^]+?)\\/\\/[ ]?%s";
        const ejsCommentRegEx = "<%\\s*\\/\\*[ ]?%s[ ]?\\*\\/\\s*%>([^]+?)<%\\s*\\/\\*[ ]?%s[ ]?\\*\\/\\s*%>";
        const xmlSnippetTemplate = "```xml\n%s\n```";
        const extRegEx = {
            ".config": { regEx: xmlCommentRegEx, template: xmlSnippetTemplate },
            ".pdl": { regEx: xmlCommentRegEx, template: xmlSnippetTemplate },
            ".csproj": { regEx: xmlCommentRegEx, template: xmlSnippetTemplate },
            ".html": { regEx: xmlCommentRegEx, template: xmlSnippetTemplate },
            ".md": { regEx: xmlCommentRegEx, template: "" },
            ".cs": { regEx: codeCommentRegEx, template: "```csharp\n%s\n```" },
            ".ts": { regEx: codeCommentRegEx, template: "```typescript\n%s\n```" },
            ".tsx": { regEx: codeCommentRegEx, template: "```typescript\n%s\n```" },
            ".ejs": { regEx: ejsCommentRegEx, template: xmlSnippetTemplate }
        };
        const fileExtension = path.extname(config.file);
        const sectionPattern = util.format(extRegEx[fileExtension].regEx, config.section, config.section);
        const sectionRegEx = new RegExp(sectionPattern, "gmi");
        const sectionContentMatches = sectionRegEx.exec(content);

        if (sectionContentMatches && sectionContentMatches.length > 0) {
            var sectionContent = sectionContentMatches.pop();
            const firstLineWhiteSpaceRegEx = new RegExp("^[ \t]+", "gm");
            const firstLineWhiteSpace = firstLineWhiteSpaceRegEx.exec(sectionContent);
            if (firstLineWhiteSpace && firstLineWhiteSpace.length > 0) {
                const regExMatchWhiteSpaceMultiLine = new RegExp(util.format("^[ \t]{%s}", firstLineWhiteSpace.pop().length), "gm");
                sectionContent = sectionContent.replace(regExMatchWhiteSpaceMultiLine, '');
            }

            return util.format(extRegEx[fileExtension].template, sectionContent);
        } else {
            console.warn("could not find section: " + sectionPattern + " in " + config.file);
            return "code sample coming soon to SamplesExtension in " + config.file;
            //throw new Error("could not find section: " + sectionPattern + " in " + config.file);
        }
    },
    /**
     * Wrap the gitdown include function to inject custom headers for nav within the document.
     * required until we deprecate auxdocs after which we can just have relative references to the docs on github.
     */
    includeFile: function (config, context) {
        if (!config.file) {
            throw new Error('config.file must be provided.');
        }

        const originalContent = gitdownIncludeHelper.compile(config, context);

        return originalContent;
    },
    /**
     * Creates a symlink to SamplesExtension to both flatten the required path depth in 
     * gitdown references that provide code snippet injection into docs and also to maintain the same folder structure that
     * will be present on github
     */
    createSymlink: function (fromDir, toDir) {
        // alternative is to use environmental variable but gitdown does not support that resolution of env var in path.  
        // so would need to do that for both regular gitdown references and for include sections
        const resolvedFromDir = path.resolve(__dirname, fromDir);
        const resolvedToDir = path.resolve(toDir);
        if (!fs.existsSync(resolvedToDir)) {
            console.log("Can't create symlink to " + resolvedToDir + "as it does not exist");
        }

        if (!fs.existsSync(resolvedFromDir)) {
            console.log("Run as elevated to Create Sym link from: " + resolvedFromDir + " to " + resolvedToDir);
            fs.symlinkSync(resolvedToDir, resolvedFromDir, 'dir');
        }
    },
    /**
     * Validates the links within a given file includes those that start with #, ., / and http
     * Links that are behind authentication (401 or 403 response codes) can not be properly verified and will not be reported as failures.
     */
    checkLinks: function (inputFile) {
        var links = [];
        var brokenLinks = [];
        return Q.ninvoke(fs, 'readFile', inputFile, 'utf8').then(function (result) {

            var urls = mdUrlExtractor(result);
            // Make sure to comment why the url is being skipped
            // Do not include http:// or https:// as they get trimmed when matching
            var urlsToSkip = [
                "aka.ms/msportalfx-test", // Github returns a 404 if you aren't authorized instead of a 403
                "examplecdn.vo.msecnd.net", // fake url
                "mybizaextensiondf.blob.core.windows.net/extension", // fake url
                "mybizaextensionprod.blob.core.windows.net/extension ", // fake url 
                "mybizaextensionprod.blob.core.windows.net/extension",  // fake url 
                "warm/newrelease/ev2", // Returns unable to get local issuer certificate
                "msinterface/form.aspx?ID=4260",  // Returns connection timed out
                "github.com/Azure/azure-marketplace/wiki", // Github returns a 404 if you aren't authorized instead of a 403/401
                "github.com/Azure/msportalfx-test", // Github returns a 404 if you aren't authorized instead of a 403/401
                "localhost",  // fake url/
                "mailto:", // email link
                "myaccess", //cert 
                "management.azure.com/api/invoke",  // returns a bad request since 
                "ms.portal.azure.com",
                "msdn.microsoft.com/en-us/library/system.reflection.assemblyversionattribute(v=vs.110", // Bug in url extractor where its not capturing the entire url
                "msdn.microsoft.com/en-us/library/system.reflection.assemblyinformationalversionattribute(v=vs.110", // Bug in url extractor where its not capturing the entire url
                "myextension.cloudapp.net",  // fake url
                "myextension.hosting.portal.azure.net",  // fake url
                "onenote", // onenote link
                "onestb.cloudapp.net",  // fake url
                "perf.demo.ext.azure.com",  // fake url
                "portal.azure.com",
                "ramweb",  // returns a certificate not trusted error
                "rc.portal.azure.com",
                "servicetree.msftcloudes.com",  // returns 302 Unauthorized (invalid)
                "sometest.vault.azure.net",
                "technet.microsoft.com/en-us/library/cc730629(v=ws.10", // Bug in url extractor where its not capturing the entire url
                "www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd&quot;&gt;", // Bug in url extractor where it captured extra characters after the url
                "&#x6d;", // html encoding for mailto: some reason there are multiple encodings
                "&#109;", // html encoding for mailto: some reason there are multiple encodings
                "\\\\products\\public\\PRODUCTS\\Developers\\Visual Studio 2015\\Enterprise 2015.3", // internal network share
                "idwebelements", // internal
                "qe" //internal
            ];

            urls.forEach(function (url) {
                // Trim the http:// or https://
                var regex = new RegExp("(^HTTPS://|HTTP://)", "i");
                var trimmedUrl = url.replace(regex, "");

                if (urlsToSkip.some(function (s) { return trimmedUrl.toUpperCase().indexOf(s.toUpperCase()) == 0 || trimmedUrl.toUpperCase().indexOf("@") >= 0; /** catch emails **/ })) {
                    //console.log(chalk.yellow("Skipping check for url: " + url));
                    return;
                }

                switch (url[0]) {
                    case "#":
                        const fragment = url.substr(1);
                        //this regex allows for a match on the markdown header tag. e.g: a fragment of #some-fragment
                        // will search the doc to see if there is any subheading e.g ### some Fragment. 
                        // github respects navigating to fragment when heading depth is >= 1
                        const matchHeading = util.format("^[#]+[\\s]?%s", fragment.replace(/-/gm, " "));
                        const matchFragment = new RegExp(matchHeading, "gmi");
                        if (!(result.includes("name=\"" + fragment + "\"") || matchFragment.exec(result))) {
                            //console.log(chalk.red("\tHyperlink " + url  + " does not refer to a valid link in the document.  Input file: " + inputFile));
                            brokenLinks.push({ "url": url, "inputFile": inputFile });
                        }
                        break;
                    case "/":
                        var sanitizedPath = url.substr(0, url.indexOf("#") > 0 ? url.indexOf("#") : url.length).replace(/\//gm, "\\");
                        var file = __dirname + sanitizedPath + (!path.extname(sanitizedPath) ? '.md' : '');
                        if (!fs.existsSync(file)) {
                            //console.log(chalk.red("\tLink : " + url + " does not resolve to valid path. Resolved path " + file + "does not exist. Input file: " + inputFile));
                            brokenLinks.push({ "url": url, "inputFile": inputFile });
                        }
                        break;
                    case "h":
                        links.push(url);
                        break;
                    case ".":
                    default:
                        var sanitizedPath = url.substr(0, url.indexOf("#") > 0 ? url.indexOf("#") : url.length).replace(/\//gm, "\\");
                        var file = path.resolve(path.dirname(inputFile), sanitizedPath);
                        if (!(fs.existsSync(file) && fs.statSync(file).isFile())) {
                            //console.log(chalk.red("\tLink : " + url + " does not resolve to valid path. Resolved path " + file + "does not exist. Input file: " + inputFile));
                            brokenLinks.push({ "url": url, "inputFile": inputFile, "reason": "Does not exist or is not a file." });
                        }
                        break;
                }
            });
        }).then(function () {
            // Check that all links are valid
            return links.reduce((prev, curr) => {
                return prev.then(() => {
                    return fetch(curr, {
                        method: "HEAD",
                        timeout: 10 * 1000 // 10 second timeout
                    }).then((response) => {
                        if (!response.ok) {
                            if (response.status === 401 /* Unauthorized */ ||
                                response.status === 403 /* Forbidden */) {
                                // Ignore authenticated endpoints
                            } else if (response.status === 404 /* Not Found */ ||
                                response.status === 405 /* Method Not Allowed */ ||
                                response.status === 503 /* Service Unavailable */) {
                                // Retry possibly unsupported HEAD requests
                                return fetch(curr, {
                                    method: "GET",
                                    timeout: 10 * 1000 // 10 second timeout
                                }).then((response) => {
                                    if (!response.ok) {
                                        throw new Error(response.statusText);
                                    }
                                })
                            } else {
                                // Bad link
                                throw new Error(response.statusText);
                            }
                        }
                    }).catch((ex) => {
                        brokenLinks.push({ "url": curr, "inputFile": inputFile, "reason": ex.message });
                    });
                });
            }, Q());
        }).then(function () {
            return brokenLinks;
        });
    }
}
