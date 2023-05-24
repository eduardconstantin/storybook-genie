<h1 align="center">Storybook Genie</h1>
<br />

Storybook Genie is a command line interface tool that can be used to convert files that contain React components into
Storybook stories.

<br /> 
<img src="cli-preview.gif"/>

<div align="center">
<br />

[![Project license](https://img.shields.io/github/license/eduardconstantin/storybook-genie?style=flat-square)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/eduardconstantin/storybook-genie?style=flat-square)](https://github.com/eduardconstantin/storybook-genie/graphs/contributors)
[![Issue](https://img.shields.io/github/issues/eduardconstantin/storybook-genie?style=flat-square)](https://github.com/eduardconstantin/storybook-genie/issues)
[![PRs](https://img.shields.io/github/issues-pr/eduardconstantin/storybook-genie?style=flat-square)](https://github.com/eduardconstantin/storybook-genie/pulls)
[![Stars](https://img.shields.io/github/stars/eduardconstantin/storybook-genie?style=flat-square)](https://github.com/eduardconstantin/storybook-genie/stargazers)

</div>

## 🌟 Features

- File selection input
- JS beautify
- A small number of dependencies

## 📦 Installation

To install the storybook-genie package, run the following command:

```bash
npm install storybook-genie
```

## 🛠️ Configuration

In order to use this package, you need to set your OpenAI API key as an environment variable. You can do this by adding
the following line to your .env file, or by setting it directly in your terminal:

For Unix-based systems:

```bash
export OPENAI_API_KEY=$YOUR_API_KEY
```

For Windows systems:

```bash
set OPENAI_API_KEY=$YOUR_API_KEY
```

## ✨ Usage

To use Storybook Genie, run the following command:

```bash
npx storybook-genie
```

## 🌱 Getting Started

Clone the repository:

```bash
git clone https://github.com/eduardconstantin/storybook-genie.git
```

Install dependencies:

```bash
npm install
```

Input your OPENAI API key in the .env file, you can get your API key
[here](https://platform.openai.com/account/api-keys):

```bash
OPENAI_API_KEY=$YOUR_API_KEY
```

Run the CLI:

```bash
npm run start
```

You will be prompted to select a file and then press enter. The generator will create a ".story.js" file in the same
folder.

## 👥 Contributing

I welcome feedback and contributions from other developers, which can help improve the quality of the code and the
application overall.

In order to create an issue or a pull request with your changes, please read
[our contribution guidelines](CONTRIBUTING.md), and thank you for being involved!

For a full list of all authors and contributors, see
[the contributors page](https://github.com/eduardconstantin/storybook-genie/contributors).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
