import { debounce } from 'debounce'

class Keselect {
  /**
   * Create keselect instance.
   *
   * @param {HTMLSelectElement} $origin Raw select element.
   * @param {Object} options Used as configuration.
   * @param {boolean} options.isDisabled Toggle enable/disable select functionality.
   * @param {function} options.onSearch Callback that called everytime when user typed on the search box.
   * @param {function} options.onDropdownOpen Callback that called after drodown has been opened.
   * @param {function} options.onDropdownClose Callback that called after dropdown has been closed.
   */
  constructor ($origin, options = {}) {
    const isValidElement = $origin instanceof HTMLElement

    if (!isValidElement) {
      throw new Error('Passed element is not a valid HTML element.')
    }

    /**
     * Keselect's configuration.
     *
     * @private
     */
    this._options = {
      isDisabled: false,
      onSearch: null,
      onDropdownOpen: null,
      onDropdownClose: null,
      ...options
    }

    /**
     * All created elements after initialization.
     *
     * @private
     */
    this._elements = { $origin }

    /**
     * Items gotten from raw select's option.
     *
     * @private
     */
    this._items = []

    /**
     * Indicate that is this class instance has been destroyed or not.
     *
     * @private
     */
    this._isDestroyed = false

    /**
     * Callback that be called when user change the value by clicking an option item.
     *
     * @private
     */
    this._onChange = null

    this._initialize()
  }

  /**
   * Initialize keselect.
   *
   * @private
   */
  _initialize () {
    this._elements = {
      ...this._elements,
      ...this._createBaseElements()
    }

    this._items = this._getItemsFromOrigin()

    const { isDisabled, onSearch } = this._options
    const { $container, $search, $dropdown, $selected, $message, $origin } = this._elements
    const $rawOptions = Object.values($origin.options)
    const isAjaxUsed = !!onSearch

    if (isAjaxUsed) {
      const $defaultItem = $rawOptions.find(($option, index) => !index)
      const selectedLabel = $defaultItem ? $defaultItem.label : ''
      const isPlaceholder = $defaultItem && !$defaultItem.value

      this._showPlaceholder(isPlaceholder)

      $selected.textContent = selectedLabel
      $message.textContent = 'Enter a keyword to find options'

      $origin
        .querySelectorAll('option')
        .forEach(($option, index) => {
          if (!index) return

          $option.remove()
        })
    } else {
      const defaultItem = this._items[$origin.selectedIndex]
      const isPlaceholderSelected = defaultItem ? defaultItem.value === '' : false
      const selectedLabel = defaultItem ? defaultItem.label : ''

      this._showPlaceholder(isPlaceholderSelected)

      $selected.textContent = selectedLabel
      $message.textContent = 'No data available'

      this._createItemElements(this._items)
    }

    if (isDisabled) {
      this._showPlaceholder()

      $origin.disabled = true
    }

    // Make container able to toggle open/close when clicked
    $container.addEventListener('click', () => {
      if (isDisabled) return

      const isDropdownOpen = $dropdown.classList.contains('keselect__dropdown--show')

      if (!isDropdownOpen) {
        $search.value = ''

        this._showMessage(!this._items.length)
        this._removeItemElements()
        this._createItemElements(this._items)
      }

      this._openDropdown(!isDropdownOpen)
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

          this._showMessage()
          this._removeItemElements()

          const fetchItems = () => {
            onSearch(keyword, (items) => {
              $message.textContent = 'No data available'

              this._removeItemElements()
              this._createItemElements(items)
              this._showMessage(!items.length)
            })
          }

          debounce(fetchItems, 500)()
        } else {
          $message.textContent = 'Enter a keyword to find options'

          this._removeItemElements()
          this._showMessage()
        }
      } else {
        const items = this._items.filter(item => {
          const pattern = new RegExp(keyword, 'ig')

          return pattern.test(item.label)
        })

        this._removeItemElements()
        this._createItemElements(items)
        this._showMessage(!items.length)
      }
    })

    // Close dropdown if escape key has been pressed
    document.addEventListener('keyup', (event) => {
      const isEscPressed = event.keyCode === 27

      if (isEscPressed) {
        this._openDropdown(false)
      }
    })

    // Close dropdown if outside has been clicked
    document.addEventListener('click', (event) => {
      const isClickOutside = !$container.contains(event.target)

      if (isClickOutside) {
        this._openDropdown(false)
      }
    })
  }

  /**
   * Get items from raw select's options.
   *
   * @private
   * @returns {Object[]} Items that would be used as keselect's option elements.
   */
  _getItemsFromOrigin () {
    const { $origin } = this._elements
    const { onSearch } = this._options
    const isAjaxUsed = !!onSearch
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

  /**
   * Create base elements that wraps the raw select element.
   * After this function called, you can access the elements from the DOM.
   *
   * @private
   * @returns {Object} Elements that has been created.
   */
  _createBaseElements () {
    const { $origin } = this._elements
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

  /**
   * Create keselect's option elements.
   *
   * @private
   * @param {Object[]} items Items that would be used as keselect's option elements.
   * @param {number} items[].index Index of the option (starts from 0).
   * @param {string} items[].label Label of the option.
   * @param {string} items[].value Value of the option.
   */
  _createItemElements (items) {
    const { $origin, $selected, $optionWrapper } = this._elements
    const { onSearch } = this._options
    const isAjaxUsed = !!onSearch

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

        this._showPlaceholder(isPlaceholderSelected)

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

        this._openDropdown(false)

        if (this._onChange) {
          this._onChange(value)
        }
      })
    })
  }

  /**
   * Remove all keselect's option elements.
   *
   * @private
   */
  _removeItemElements () {
    const { $optionWrapper } = this._elements

    $optionWrapper
      .querySelectorAll('.keselect__option')
      .forEach($option => $option.remove())
  }

  /**
   * Toggle open/close dropdown.
   *
   * @private
   * @param {boolean} [isOpen=true] Are you want to open the dropdown or not ?
   */
  _openDropdown (isOpen = true) {
    const { $dropdown } = this._elements
    const { onDropdownOpen, onDropdownClose } = this._options

    if (isOpen) {
      $dropdown.classList.remove('keselect__dropdown--hide')
      $dropdown.classList.add('keselect__dropdown--show')

      if (onDropdownOpen) {
        onDropdownOpen()
      }
    } else {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      if (onDropdownClose) {
        onDropdownClose()
      }
    }
  }

  /**
   * Toggle show/hide message inside dropdown.
   *
   * @private
   * @param {boolean} [isShow=true] Are you want to show the message or not ?
   */
  _showMessage (isShow = true) {
    const { $messageWrapper } = this._elements

    if (isShow) {
      $messageWrapper.classList.remove('keselect__message-wrapper--hide')
      $messageWrapper.classList.add('keselect__message-wrapper--show')
    } else {
      $messageWrapper.classList.remove('keselect__message-wrapper--show')
      $messageWrapper.classList.add('keselect__message-wrapper--hide')
    }
  }

  /**
   * Toggle set selected option in select box as placeholder or regular selected.
   *
   * @private
   * @param {boolean} [isShow=true] Are you want to show selected as placeholder ?
   */
  _showPlaceholder (isShow = true) {
    const { $selected } = this._elements

    if (isShow) {
      $selected.classList.add('keselect__selected--placeholder')
    } else {
      $selected.classList.remove('keselect__selected--placeholder')
    }
  }

  /**
   * Set new value but can be used only if "onSearch" callback is not defined.
   *
   * @param {string} value New value
   */
  setValue (value) {
    if (this._isDestroyed) {
      throw new Error('Instance has been destroyed.')
    }

    const { $selected, $optionWrapper } = this._elements
    const { onSearch } = this._options
    const isAjaxUsed = !!onSearch
    const isValueInvalid = typeof value !== 'string'

    if (isValueInvalid) {
      throw new Error('Value should use "string" as data type.')
    }

    if (isAjaxUsed) {
      throw new Error('Method "setValue" cannot be used when "onSearch" callback used.')
    }

    const item = this._items.find(item => {
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

    this._showPlaceholder(!value)

    $selected.textContent = item.label
    this._elements.$origin.selectedIndex = item.index
  }

  /**
   * Get keselect's value.
   *
   * @returns {string} Keselect value
   */
  getValue () {
    if (this._isDestroyed) {
      throw new Error('Instance has been destroyed.')
    }

    return this._elements.$origin.value
  }

  /**
   * Destroy keselect's instance.
   */
  destroy () {
    if (this._isDestroyed) {
      throw new Error('Instance has been destroyed.')
    }

    const { $container, $origin } = this._elements

    $container.parentNode.insertBefore($origin, $container)
    $container.remove()

    this._isDestroyed = true
  }

  /**
   * An event listener that listen to everytime user change the value by clicking an option item.
   *
   * @param {Function} callback Called when user change the value.
   */
  onChange (callback) {
    if (this._isDestroyed) {
      throw new Error('Instance has been destroyed.')
    }

    if (callback) {
      this._onChange = callback
    }
  }
}

export default Keselect
