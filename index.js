#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import ora from "ora";
import dotenv from "universal-dotenv";
import { componentConverter } from "./src/converter.js";
import { fileSelector } from "./src/selector.js";
import path from "path";
import beautify from "js-beautify";

const options = {
  indent_size: 2,
  jslint_happy: true,
  end_with_newline: false,
  e4x: true,
};

const resetOptions = {
  e4x: true,
  preserve_newlines: false,
  indent_level: 0,
  indent_size: 0,
};

dotenv.init();

async function run() {
  await fileSelector({
    message: "Enter the path to the input file or directory:",
    basePath: "./",
    pageSize: 10,
  }).then(async (file) => {
    if (!file) return;
    const input = readFileSync(file, "utf-8");
    const extension = path.extname(file);
    const spinner = ora("Generating story...").start();
    const story = await componentConverter(input.replace(/^\s*[\r\n]/gm, "").trim(), process.env.OPENAI_API_KEY).then(
      (story) => {
        story = beautify(story, resetOptions);
        return beautify(story, options);
      }
    );
    writeFileSync(file.replace(extension, `.story${extension}`), story);
    spinner.stop();
  });
}

await run();
