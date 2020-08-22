import { debounce } from 'debounce'

/**
 * Create base elements that wraps the raw select element.
 * After this function called, you can access the elements from the DOM.
 *
 * @param {HTMLSelectElement} $origin Raw select element.
 * @return {undefined}
 */
const createBaseElements = ($origin) => {
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
}

/**
 * Create keselect's option elements.
 *
 * @param {Object[]} items Items that would be used to create keselect's option elements.
 * @param {number} items[].index Index of the option.
 * @param {string} items[].label Label of the option.
 * @param {string} items[].value Value of the option.
 * @param {HTMLSelectElement} $origin Raw select element.
 * @param {boolean} [isAjaxUsed=false] Are you want to use Ajax to get the options ?
 * @return {undefined}
 */
const createOptionElements = (items, $origin, isAjaxUsed = false) => {
  const $container = $origin.parentElement
  const $selected = $container.querySelector('.keselect__selected')
  const $dropdown = $container.querySelector('.keselect__dropdown')
  const $optionWrapper = $container.querySelector('.keselect__option-wrapper')

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

      openDropdown($dropdown, false)
    })
  })
}

/**
 * Toggle open/close dropdown.
 *
 * @param {HTMLDivElement} $dropdown Element that act as dropdown.
 * @param {boolean} [isOpen=true] Are you want to open the dropdown or not ?
 * @return {undefined}
 */
const openDropdown = ($dropdown, isOpen = true) => {
  if (isOpen) {
    $dropdown.classList.remove('keselect__dropdown--hide')
    $dropdown.classList.add('keselect__dropdown--show')
  } else {
    $dropdown.classList.remove('keselect__dropdown--show')
    $dropdown.classList.add('keselect__dropdown--hide')
  }
}

/**
 * Toggle show/hide message inside dropdown.
 *
 * @param {HTMLDivElement} $messageWrapper Element that wraps element that contains message.
 * @param {boolean} [isShow=true] Are you want to show the message or not ?
 * @return {undefined}
 */
const showMessage = ($messageWrapper, isShow = true) => {
  if (isShow) {
    $messageWrapper.classList.remove('keselect__message-wrapper--hide')
    $messageWrapper.classList.add('keselect__message-wrapper--show')
  } else {
    $messageWrapper.classList.remove('keselect__message-wrapper--show')
    $messageWrapper.classList.add('keselect__message-wrapper--hide')
  }
}

/**
 * Remove all keselect's option elements.
 *
 * @param {HTMLDivElement} $optionWrapper Element that wraps keselect's option elements.
 * @return {undefined}
 */
const removeOptionElements = ($optionWrapper) => {
  $optionWrapper
    .querySelectorAll('.keselect__option')
    .forEach($option => $option.remove())
}

/**
 * Get position where dropdown should be open.
 *
 * @param {HTMLDivElement} $container Element that wraps raw select element.
 * @return {string} Dropdown position.
 */
const getDropdownPosition = ($container) => {
  const viewportHeight = window.innerHeight
  const containerOffset = $container.offsetTop + $container.offsetHeight
  const diff = viewportHeight - containerOffset
  const position = diff > 240 ? 'bottom' : 'top'

  return position
}

/**
 * The main function used to turn raw select into keselect.
 *
 * @param {HTMLSelectElement} $origin Raw select element.
 * @param {Object} [$options={}] Keselect's configuration.
 * @return {HTMLDivElement} Element that wraps raw select element.
 */
const keselect = ($origin, options = {}) => {
  const defaultOptions = {
    isDisabled: false,
    isAjaxUsed: false,
    onSearch: () => {},
    onDropdownOpen: () => {},
    onDropdownClose: () => {},
    ...options
  }

  const isValidElement = $origin instanceof HTMLElement

  if (!isValidElement) {
    console.error('Passed element is not a valid HTML element.')
    return null
  }

  const { isDisabled, isAjaxUsed, onSearch, onDropdownOpen, onDropdownClose } = defaultOptions
  const $rawOptions = Object.values($origin.options)

  // Get options data from inside original select element
  const items = $rawOptions
    .filter(() => !isAjaxUsed)
    .map(($option, index) => ({
      index,
      label: $option.label,
      value: $option.value
    }))

  createBaseElements($origin)

  const $container = $origin.parentElement
  const position = getDropdownPosition($container)

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

  $dropdown.classList.add(`keselect__dropdown--${position}`)

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
    const defaultItem = items[$origin.selectedIndex]
    const isPlaceholderSelected = defaultItem ? defaultItem.value === '' : false
    const selectedLabel = defaultItem ? defaultItem.label : ''

    if (isPlaceholderSelected) {
      $selected.classList.add('keselect__selected--placeholder')
    }

    $selected.textContent = selectedLabel
    $message.textContent = 'No data available'

    createOptionElements(items, $origin)
  }

  if (isDisabled) {
    $selected.classList.add('keselect__selected--placeholder')
    $origin.disabled = true
  }

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    if (isDisabled) return

    const isDropdownOpen = $dropdown.classList.contains('keselect__dropdown--show')

    openDropdown($dropdown, !isDropdownOpen)

    if (isDropdownOpen) {
      onDropdownClose()
    } else {
      $search.value = ''

      showMessage($messageWrapper, !items.length)
      removeOptionElements($optionWrapper)
      createOptionElements(items, $origin)
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

        showMessage($messageWrapper)
        removeOptionElements($optionWrapper)

        const fetchItems = () => {
          onSearch(keyword, (newItems) => {
            $message.textContent = 'No data available'

            removeOptionElements($optionWrapper)
            createOptionElements(newItems, $origin, isAjaxUsed)
            showMessage($messageWrapper, !newItems.length)
          })
        }

        debounce(fetchItems, 500)()
      } else {
        $message.textContent = 'Enter a keyword to find options'

        removeOptionElements($optionWrapper)
        showMessage($messageWrapper)
      }
    } else {
      const newItems = items.filter(item => {
        const pattern = new RegExp(keyword, 'ig')

        return pattern.test(item.label)
      })

      removeOptionElements($optionWrapper)
      createOptionElements(newItems, $origin)
      showMessage($messageWrapper, !newItems.length)
    }
  })

  // Close dropdown if escape key has been pressed
  document.addEventListener('keyup', (event) => {
    const isEscPressed = event.keyCode === 27

    if (isEscPressed) {
      openDropdown($dropdown, false)
      onDropdownClose()
    }
  })

  // Close dropdown if outside has been clicked
  document.addEventListener('click', (event) => {
    const isClickOutside = !$container.contains(event.target)

    if (isClickOutside) {
      openDropdown($dropdown, false)
      onDropdownClose()
    }
  })

  return $container
}

export default keselect
