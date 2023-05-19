import {
  createPrompt,
  useState,
  useRef,
  usePrefix,
  useKeypress,
  isEnterKey,
  isNumberKey,
  isUpKey,
  isDownKey,
  Paginator,
  Separator,
} from "@inquirer/core";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import figures from "figures";
import ansiEscapes from "ansi-escapes";

function isSelectableChoice(file) {
  return file != null && file.type !== "separator" && !file.disabled;
}

export const fileSelector = createPrompt((config, done) => {
  const { basePath, message } = config;

  const paginator = useRef(new Paginator()).current;
  const firstRender = useRef(true);
  const prefix = usePrefix();

  const [cursorPosition, setCursorPos] = useState(1);
  const [filePath, setFilePath] = useState(basePath);
  const [status, setStatus] = useState("pending");

  let files = fs.readdirSync(filePath).map((file) => {
    const fullPath = path.join(filePath, file);
    const isDirectory = fs.lstatSync(fullPath).isDirectory();
    const displayText = isDirectory ? `${chalk.blue("[DIR]")} ${file}` : file;
    return {
      name: displayText,
      value: isDirectory ? `${fullPath}/` : fullPath,
      isDirectory: isDirectory,
    };
  });

  const goBackOption = { name: chalk.gray("[..] BACK"), value: "..", isDirectory: false };
  const exitOption = { name: chalk.redBright("[X] EXIT"), value: null, isDirectory: false };

  const choices = [...files].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) {
      return -1;
    }
    if (!a.isDirectory && b.isDirectory) {
      return 1;
    }
    return 0;
  });

  choices.unshift(new Separator());
  if (filePath !== "./") choices.unshift(goBackOption);
  choices.push(new Separator());
  choices.push(exitOption);

  const choice = choices[cursorPosition];

  useKeypress((key) => {
    if (isEnterKey(key)) {
      const selectedOption = choices[cursorPosition];

      if (selectedOption.value === "..") {
        const parentDirectory = path.dirname(filePath);
        setFilePath(parentDirectory + "/");
        setCursorPos(1);
      } else if (selectedOption.value === null) {
        setStatus("exit");
        done(null);
      } else if (selectedOption.isDirectory) {
        setFilePath(selectedOption.value);
        setCursorPos(2);
      } else {
        setStatus("done");
        done(`./${selectedOption.value}`);
      }
    } else if (isUpKey(key) || isDownKey(key)) {
      let newCursorPosition = cursorPosition;
      const offset = isUpKey(key) ? -1 : 1;
      let selectedOption;

      while (!isSelectableChoice(selectedOption)) {
        newCursorPosition = (newCursorPosition + offset + choices.length) % choices.length;
        selectedOption = choices[newCursorPosition];
      }

      setCursorPos(newCursorPosition);
    } else if (isNumberKey(key)) {
      const newCursorPosition = Number(key.name) - 1;

      if (!isSelectableChoice(choices[newCursorPosition])) {
        return;
      }

      setCursorPos(newCursorPosition);
    }
  });

  if (status === "done") {
    return `${prefix} ${message} ${chalk.cyan(choice.name || choice.value)}`;
  }
  if (status === "exit") {
    return `${prefix} ${message} ${chalk.redBright("File selection canceled.")}`;
  }

  const allChoices = choices
    .map((choice, index) => {
      if (choice.type === "separator") {
        return ` ${choice.separator}`;
      }

      const line = choice.name || choice.value;
      if (choice.disabled) {
        const disabledLabel = typeof choice.disabled === "string" ? choice.disabled : "(disabled)";
        return chalk.dim(`- ${line} ${disabledLabel}`);
      }

      if (index === cursorPosition) {
        return chalk.cyan(`${figures.pointer} ${line}`);
      }

      return `  ${line}`;
    })
    .join("\n");

  let output = chalk.bold(message);
  if (firstRender.current) {
    output += chalk.dim(" (Use arrow keys)");
    firstRender.current = false;
  }

  const windowedChoices = paginator.paginate(allChoices, cursorPosition, config.pageSize);
  return `${prefix} ${output}\n${windowedChoices}${ansiEscapes.cursorHide}`;
});
