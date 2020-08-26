import { debounce } from 'debounce'

class Keselect {
  constructor ($origin, options = {}) {
    const isValidElement = $origin instanceof HTMLElement

    if (!isValidElement) {
      throw new Error('Passed element is not a valid HTML element.')
    }

    this.options = {
      isDisabled: false,
      isAjaxUsed: false,
      onSearch: () => {},
      onDropdownOpen: () => {},
      onDropdownClose: () => {},
      ...options
    }

    this.elements = { $origin }
    this.items = []

    this.initialize()
  }

  initialize () {
    this.elements = {
      ...this.elements,
      ...this.createBaseElements()
    }

    this.items = this.getOptionsFromOrigin()

    const { isAjaxUsed, isDisabled, onSearch, onDropdownClose, onDropdownOpen } = this.options
    const { $container, $search, $dropdown, $selected, $message, $origin } = this.elements
    const $rawOptions = Object.values($origin.options)

    if (isAjaxUsed) {
      const $defaultItem = $rawOptions.find(($option, index) => !index)
      const selectedLabel = $defaultItem ? $defaultItem.label : ''

      if ($defaultItem && !$defaultItem.value) {
        $selected.classList.add('keselect__selected--placeholder')
      }

      $selected.textContent = selectedLabel
      $message.textContent = 'Enter a keyword to find options'

      $origin
        .querySelectorAll('option')
        .forEach(($option, index) => {
          if (!index) return

          $option.remove()
        })
    } else {
      const defaultItem = this.items[$origin.selectedIndex]
      const isPlaceholderSelected = defaultItem ? defaultItem.value === '' : false
      const selectedLabel = defaultItem ? defaultItem.label : ''

      if (isPlaceholderSelected) {
        $selected.classList.add('keselect__selected--placeholder')
      }

      $selected.textContent = selectedLabel
      $message.textContent = 'No data available'

      this.createItemElements(this.items)
    }

    if (isDisabled) {
      $selected.classList.add('keselect__selected--placeholder')
      $origin.disabled = true
    }

    // Make container able to toggle open/close when clicked
    $container.addEventListener('click', () => {
      if (isDisabled) return

      const isDropdownOpen = $dropdown.classList.contains('keselect__dropdown--show')

      this.openDropdown(!isDropdownOpen)

      if (isDropdownOpen) {
        onDropdownClose()
      } else {
        $search.value = ''

        this.showMessage(!this.items.length)
        this.removeItemElements()
        this.createItemElements(this.items)
        onDropdownOpen()
      }
    })

    // Prevent event bubbling when dropdown clicked
    $dropdown.addEventListener('click', (event) => {
      event.stopPropagation()
    })

    // Filter the options by keyword
    $search.addEventListener('input', (event) => {
      const keyword = event.target.value

      if (isAjaxUsed) {
        if (keyword.length >= 1) {
          $message.textContent = 'Searching...'

          this.showMessage()
          this.removeItemElements()

          const fetchItems = () => {
            onSearch(keyword, (items) => {
              $message.textContent = 'No data available'

              this.removeItemElements()
              this.createItemElements(items)
              this.showMessage(!items.length)
            })
          }

          debounce(fetchItems, 500)()
        } else {
          $message.textContent = 'Enter a keyword to find options'

          this.removeItemElements()
          this.showMessage()
        }
      } else {
        const items = this.items.filter(item => {
          const pattern = new RegExp(keyword, 'ig')

          return pattern.test(item.label)
        })

        this.removeItemElements()
        this.createItemElements(items)
        this.showMessage(!items.length)
      }
    })

    // Close dropdown if escape key has been pressed
    document.addEventListener('keyup', (event) => {
      const isEscPressed = event.keyCode === 27

      if (isEscPressed) {
        this.openDropdown(false)
        onDropdownClose()
      }
    })

    // Close dropdown if outside has been clicked
    document.addEventListener('click', (event) => {
      const isClickOutside = !$container.contains(event.target)

      if (isClickOutside) {
        this.openDropdown(false)
        onDropdownClose()
      }
    })
  }

  getOptionsFromOrigin () {
    const { $origin } = this.elements
    const { isAjaxUsed } = this.options
    const $rawOptions = Object.values($origin.options)

    const items = $rawOptions
      .filter(() => !isAjaxUsed)
      .map(($option, index) => ({
        index,
        label: $option.label,
        value: $option.value
      }))

    return items
  }

  createBaseElements () {
    const { $origin } = this.elements
    const $container = document.createElement('div')

    $container.classList.add('keselect__container')

    $container.innerHTML = `
      <div class="keselect__selected-wrapper">
        <p class="keselect__selected"></p>
        <span class="keselect__arrow">&dtrif;</span>
      </div>
      <div class="keselect__dropdown keselect__dropdown--hide">
        <div class="keselect__search-wrapper">
          <input class="keselect__search" type="text" value="" />
        </div>
        <div class="keselect__message-wrapper keselect__message-wrapper--hide">
          <p class="keselect__message"></p>
        </div>
        <div class="keselect__option-wrapper"></div>
      </div>
    `

    $origin.parentNode.insertBefore($container, $origin)
    $container.prepend($origin)

    const [
      $selected,
      $dropdown,
      $search,
      $messageWrapper,
      $message,
      $optionWrapper
    ] = [
      $container.querySelector('.keselect__selected'),
      $container.querySelector('.keselect__dropdown'),
      $container.querySelector('.keselect__search'),
      $container.querySelector('.keselect__message-wrapper'),
      $container.querySelector('.keselect__message'),
      $container.querySelector('.keselect__option-wrapper')
    ]

    const viewportHeight = window.innerHeight
    const containerOffset = $container.offsetTop + $container.offsetHeight
    const diff = viewportHeight - containerOffset
    const position = diff > 240 ? 'bottom' : 'top'

    $dropdown.classList.add(`keselect__dropdown--${position}`)

    return {
      $container,
      $selected,
      $dropdown,
      $search,
      $messageWrapper,
      $message,
      $optionWrapper
    }
  }

  createItemElements (items) {
    const { $origin, $selected, $optionWrapper } = this.elements
    const { isAjaxUsed, onDropdownClose } = this.options

    $optionWrapper.innerHTML = `
      ${items.map(item => {
        const { index, label, value } = item
        const isSelected = isAjaxUsed ? false : item.index === $origin.selectedIndex
        const selectedClass = isSelected ? 'keselect__option--selected' : ''

        return `
          <div 
            class="keselect__option ${selectedClass}"
            data-index="${index}"
            data-label="${label}"
            data-value="${value}"
          >
            <p>${label}</p>
          </div>
        `
      }).join('\n')}
    `

    const $options = $optionWrapper.querySelectorAll('.keselect__option')

    // Assign event listener to all option elements
    $options.forEach(($option) => {
      $option.addEventListener('click', () => {
        const { index, label, value } = $option.dataset
        const isPlaceholderSelected = value === ''
        const $prevOption = $optionWrapper.querySelector('.keselect__option--selected')

        if ($prevOption) {
          $prevOption.classList.remove('keselect__option--selected')
        }

        $option.classList.add('keselect__option--selected')

        if (isPlaceholderSelected) {
          $selected.classList.add('keselect__selected--placeholder')
        } else {
          $selected.classList.remove('keselect__selected--placeholder')
        }

        $selected.textContent = label

        if (isAjaxUsed) {
          $origin.innerHTML = `
            <option value="${value}" selected>
              ${label}
            </option>
          `
        } else {
          $origin.selectedIndex = index
        }

        this.openDropdown(false)
        onDropdownClose()
      })
    })
  }

  removeItemElements () {
    const { $optionWrapper } = this.elements

    $optionWrapper
      .querySelectorAll('.keselect__option')
      .forEach($option => $option.remove())
  }

  openDropdown (isOpen = true) {
    const { $dropdown } = this.elements

    if (isOpen) {
      $dropdown.classList.remove('keselect__dropdown--hide')
      $dropdown.classList.add('keselect__dropdown--show')
    } else {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')
    }
  }

  showMessage (isShow = true) {
    const { $messageWrapper } = this.elements

    if (isShow) {
      $messageWrapper.classList.remove('keselect__message-wrapper--hide')
      $messageWrapper.classList.add('keselect__message-wrapper--show')
    } else {
      $messageWrapper.classList.remove('keselect__message-wrapper--show')
      $messageWrapper.classList.add('keselect__message-wrapper--hide')
    }
  }

  setValue (value) {
    const { $selected, $optionWrapper } = this.elements
    const { isAjaxUsed } = this.options
    const isValueInvalid = typeof value !== 'string'

    if (isValueInvalid) {
      throw new Error('Value should use "string" as data type.')
    }

    if (isAjaxUsed) {
      throw new Error('Method "setValue" cannot be used when "isAjaxUsed" active.')
    }

    const item = this.items.find(item => {
      return item.value === value
    })

    if (!item) {
      throw new Error('Options was not found.')
    }

    const $option = $optionWrapper.querySelectorAll('.keselect__option')[item.index]
    const $prevOption = $optionWrapper.querySelector('.keselect__option--selected')

    if ($prevOption) {
      $prevOption.classList.remove('keselect__option--selected')
    }

    $option.classList.add('keselect__option--selected')

    if (value) {
      $selected.classList.remove('keselect__selected--placeholder')
    } else {
      $selected.classList.add('keselect__selected--placeholder')
    }

    $selected.textContent = item.label
    this.elements.$origin.selectedIndex = item.index
  }

  getValue () {
    return this.elements.$origin.value
  }
}

export default Keselect
