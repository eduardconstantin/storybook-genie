import fs from "fs";
import path from "path";
import {
  createPrompt,
  useState,
  useRef,
  useKeypress,
  isEnterKey,
  isNumberKey,
  isUpKey,
  isDownKey,
  Paginator,
  Separator,
} from "@inquirer/core";

const isSelectableChoice = (file) => {
  return file != null && file.type !== "separator" && !file.disabled;
};

export const fileSelector = createPrompt((config, done) => {
  const { basePath = "./", message, pageSize = 10, extensions = [".js", ".jsx", ".ts", ".tsx"] } = config;

  const paginator = useRef(new Paginator()).current;
  const firstRender = useRef(true);

  const [cursorPosition, setCursorPos] = useState(1);
  const [filePath, setFilePath] = useState(basePath);
  const [status, setStatus] = useState("pending");

  let files = fs
    .readdirSync(filePath)
    .reduce((acc, file) => {
      const fullPath = path.join(filePath, file);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();

      if (isDirectory || extensions.includes(path.extname(file))) {
        const displayText = isDirectory ? `\x1b[94m\x1b[1m[DIR]\x1b[0m ${file}` : file;
        acc.push({
          name: displayText,
          value: isDirectory ? `${fullPath}/` : fullPath,
          isDirectory: isDirectory,
        });
      }

      return acc;
    }, [])
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      }
      if (!a.isDirectory && b.isDirectory) {
        return 1;
      }
      return 0;
    });

  const goBackOption = { name: `\x1b[90m[..]  BACK\x1b[0m`, value: "..", isDirectory: false };
  const exitOption = { name: `\x1b[91mⓧ  EXIT\x1b[0m`, value: null, isDirectory: false };

  files.unshift(new Separator());
  if (filePath !== "./") files.unshift(goBackOption);
  files.push(new Separator());
  files.push(exitOption);

  const choice = files[cursorPosition];

  useKeypress((key) => {
    if (isEnterKey(key)) {
      const selectedOption = files[cursorPosition];

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
        newCursorPosition = (newCursorPosition + offset + files.length) % files.length;
        selectedOption = files[newCursorPosition];
      }

      setCursorPos(newCursorPosition);
    } else if (isNumberKey(key)) {
      const newCursorPosition = Number(key.name) - 1;

      if (!isSelectableChoice(files[newCursorPosition])) {
        return;
      }

      setCursorPos(newCursorPosition);
    }
  });

  if (status === "done") {
    return `\x1b[92m\x1b[1m✔ Selected file: ${choice.name || choice.value}\x1b[0m`;
  }
  if (status === "exit") {
    return `\x1b[91m\x1b[1m✘ File selection canceled.\x1b[0m`;
  }

  const allFiles = files
    .map((choice, index) => {
      if (choice.type === "separator") {
        return ` ${choice.separator}`;
      }

      const line = choice.name || choice.value;
      if (choice.disabled) {
        const disabledLabel = typeof choice.disabled === "string" ? choice.disabled : "(disabled)";
        return `\x1b[90m- ${line} ${disabledLabel}\x1b[0m`;
      }

      if (index === cursorPosition) {
        return line.split(" ").length === 2
          ? `\x1b[36m❯ ${line.split(" ")[0]}\x1b[0m \x1b[36m${line.split(" ")[1]}\x1b[0m`
          : `\x1b[36m❯ ${line}\x1b[0m`;
      }

      return `  ${line}`;
    })
    .join("\n");

  let output = `\x1b[1m${message}\x1b[0m`;
  if (firstRender.current) {
    output += `\x1b[90m ↕ (Use arrow keys)\x1b[0m`;
    firstRender.current = false;
  }

  const windowedChoices = paginator.paginate(allFiles, cursorPosition, pageSize);
  return `\x1b[92m┇\x1b[0m ${output}\n${windowedChoices}\x1B[?25l`;
});
