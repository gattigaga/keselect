# Keselect

Keselect is a zero dependencies improved selectbox that have feature to search the options.

* Easy to use
* Able to set the options from Ajax
* It's jQuery free

## Install

You can download it from:

https://github.com/gattigaga/keselect/releases

or

You can install it via NPM:

```bash
npm install keselect
```

## Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo | Keselect</title>
    <link rel="stylesheet" href="./keselect.min.css" />
    <style>
      body {
        margin: 0px;
        padding: 0px;
      }

      .container {
        height: 100vh;
        padding: 16px;
        box-sizing: border-box;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <select name="language_id" id="languages">
        <option value="">Select Language</option>
        <option value="1">Bahasa Indonesia</option>
        <option value="2">Arabic</option>
        <option value="3">English</option>
        <option value="4">Japanese</option>
        <option value="5">Chinese</option>
        <option value="6">Russian</option>
      </select>
    </div>

    <script src="./keselect.min.js"></script>
    <script>
      const $languages = document.getElementById("languages");

      keselect($languages);
    </script>
  </body>
</html>
```

## Options

| Key                   | Type                                                | Default Value | Description                                 |
|-----------------------|-----------------------------------------------------|---------------|---------------------------------------------|
| ```isDisabled```      | ```boolean```                                       | ```false```   | Toggle disable select functionality.        |
| ```onSearch```        | ```(keyword: string, setItems: Function) => void``` | ```null```    | Used to set options from Ajax result.       |
| ```onDropdownClose``` | ```() => void```                                    | ```null```    | Callback that called after dropdown closed. |
| ```onDropdownOpen```  | ```() => void```                                    | ```null```    | Callback that called after dropdown opened. |

## Methods

| Name                  | Type                              | Description                                 |
|-----------------------|-----------------------------------|---------------------------------------------|
| ```setValue```        | ```(value: string) => void```     | Toggle disable select functionality.        |
| ```getValue```        | ```() => string```                | Used to set options from Ajax result.       |

## Development

```npm start``` - to start development environment

```npm test``` - to test the project

```npm run build``` - to build project in production

## License

This project is licensed under the MIT License.

