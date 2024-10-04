import fs from "fs";
import path from "path";
import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
  isNumberKey,
  isUpKey,
  isDownKey,
  usePagination,
  Separator,
} from "@inquirer/core";

const isSelectableChoice = (file) => {
  return file != null && file.type !== "separator" && !file.disabled;
};

export const fileSelector = createPrompt((config, done) => {
  const { basePath = "./", message, pageSize = 10, extensions = [".js", ".jsx", ".ts", ".tsx"] } = config;

  const [cursorPosition, setCursorPos] = useState(1);
  const [filePath, setFilePath] = useState(basePath);
  const [status, setStatus] = useState("pending");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Function to reset cursor to the first selectable item
  const resetCursorToFirstSelectable = (files) => {
    for (let i = 0; i < files.length; i++) {
      if (isSelectableChoice(files[i])) {
        setCursorPos(i); // Set cursor to the first selectable item
        break;
      }
    }
  };

  // Retrieve files and directories
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

  // Add navigation options
  const goBackOption = { name: `\x1b[90m[..]  BACK\x1b[0m`, value: "..", isDirectory: true };
  const exitOption = { name: `\x1b[91mⓧ  EXIT\x1b[0m`, value: null, isDirectory: false };
  const submitOption = { name: `\x1b[92m✔  SUBMIT SELECTED FILES\x1b[0m`, value: "submit", isDirectory: false };

  files.unshift(new Separator());
  if (filePath !== "./") files.unshift(goBackOption); // Show the back option if not in root
  files.push(new Separator());
  files.push(submitOption); // Add Submit option above Exit
  files.push(exitOption);

  const choice = files[cursorPosition];

  useKeypress((key) => {
    if (isEnterKey(key)) {
      const selectedOption = files[cursorPosition];

      if (selectedOption.isDirectory) {
        // Navigate into directory
        if (selectedOption.value === "..") {
          const parentDirectory = path.dirname(filePath);
          setFilePath(parentDirectory + "/");
        } else {
          setFilePath(selectedOption.value); // Go into selected directory
        }
        setCursorPos(0); // Reset cursor when entering new directory
      } else if (selectedOption.value === null) {
        // Exit option
        setStatus("exit");
        done(null);
      } else if (selectedOption.value === "submit") {
        // Handle file submission
        setStatus("done"); // Change status to done
        done(selectedFiles); // Call done with selected files
      } else {
        // Select or deselect file
        if (selectedFiles.includes(selectedOption.value)) {
          setSelectedFiles(selectedFiles.filter(file => file !== selectedOption.value));
        } else {
          setSelectedFiles([...selectedFiles, selectedOption.value]);
        }
      }
    } else if (isUpKey(key) || isDownKey(key)) {
      // Handle navigation through file list
      let newCursorPosition = cursorPosition;
      const offset = isUpKey(key) ? -1 : 1;
      let selectedOption;

      // Ensure the new option is selectable
      while (!isSelectableChoice(selectedOption)) {
        newCursorPosition = (newCursorPosition + offset + files.length) % files.length;
        selectedOption = files[newCursorPosition];
      }

      setCursorPos(newCursorPosition);
    } else if (isNumberKey(key)) {
      // Allow quick selection via number keys
      const newCursorPosition = Number(key.name) - 1;

      if (!isSelectableChoice(files[newCursorPosition])) {
        return;
      }

      setCursorPos(newCursorPosition);
    }
  });

  if (status === "done") {
    return `\x1b[92m\x1b[1m✔ Selected files: ${selectedFiles.join(", ")}\x1b[0m`;
  }
  if (status === "exit") {
    return `\x1b[91m\x1b[1m✘ File selection canceled.\x1b[0m`;
  }

  const allFiles = files.map((choice, index) => {
    if (choice.type === "separator") {
      return ` ${choice.separator}`;
    }

    const line = choice.name || choice.value;
    const isSelected = selectedFiles.includes(choice.value);
    const selectedMarker = isSelected ? "\x1b[92m✔\x1b[0m " : "  ";
    if (choice.disabled) {
      const disabledLabel = typeof choice.disabled === "string" ? choice.disabled : "(disabled)";
      return `\x1b[90m- ${line} ${disabledLabel}\x1b[0m`;
    }

    if (index === cursorPosition) {
      return `${selectedMarker}\x1b[36m❯ ${line}\x1b[0m`;
    }

    return ` ${selectedMarker} ${line}`;
  });

  const windowedChoices = usePagination({
    items: allFiles,
    pageSize,
    active: cursorPosition,
    renderItem: (layout) => layout.item,
    loop: false,
  });
  return `\x1b[92m┇\x1b[0m ${message}\n${windowedChoices}\x1B[?25l`;
});
