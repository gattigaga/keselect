import { debounce } from 'debounce'

const createBaseElements = ($origin) => {
  const $container = document.createElement('div')
  $container.classList.add('keselect')

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
  const openDropdown = createToggleDropdown($dropdown)

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

      openDropdown(false)
    })
  })
}

const createToggleDropdown = ($dropdown) => (isOpen) => {
  if (isOpen) {
    $dropdown.classList.remove('keselect__dropdown--hide')
    $dropdown.classList.add('keselect__dropdown--show')
  } else {
    $dropdown.classList.remove('keselect__dropdown--show')
    $dropdown.classList.add('keselect__dropdown--hide')
  }
}

const createToggleMessageText = ($messageWrapper) => (isShow) => {
  if (isShow) {
    $messageWrapper.classList.remove('keselect__message-wrapper--hide')
    $messageWrapper.classList.add('keselect__message-wrapper--show')
  } else {
    $messageWrapper.classList.remove('keselect__message-wrapper--show')
    $messageWrapper.classList.add('keselect__message-wrapper--hide')
  }
}

const removeOptionElements = ($optionWrapper) => {
  $optionWrapper
    .querySelectorAll('.keselect__option')
    .forEach($option => $option.remove())
}

const getDropdownPosition = ($container) => {
  const viewportHeight = window.innerHeight
  const containerOffset = $container.offsetTop + $container.offsetHeight
  const diff = viewportHeight - containerOffset
  const position = diff > 240 ? 'bottom' : 'top'

  return position
}

const keselect = ($origin, options = {}) => {
  const isValidElement = $origin instanceof HTMLElement

  if (!isValidElement) {
    console.error('Passed element is not a valid HTML element.')
    return null
  }

  const { isAjaxUsed, onSearch } = options
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

  const openDropdown = createToggleDropdown($dropdown)
  const showMessageText = createToggleMessageText($messageWrapper)

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    const isDropdownOpen = $dropdown.classList.contains('keselect__dropdown--show')

    openDropdown(!isDropdownOpen)

    if (!isDropdownOpen) {
      $search.value = ''

      showMessageText(!items.length)
      removeOptionElements($optionWrapper)
      createOptionElements(items, $origin)
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

        showMessageText(true)
        removeOptionElements($optionWrapper)

        const fetchItems = () => {
          onSearch(keyword, (newItems) => {
            $message.textContent = 'No data available'

            removeOptionElements($optionWrapper)
            createOptionElements(newItems, $origin, isAjaxUsed)
            showMessageText(!newItems.length)
          })
        }

        debounce(fetchItems, 500)()
      } else {
        $message.textContent = 'Enter a keyword to find options'

        removeOptionElements($optionWrapper)
        showMessageText(true)
      }
    } else {
      const newItems = items.filter(item => {
        const pattern = new RegExp(keyword, 'ig')

        return pattern.test(item.label)
      })

      removeOptionElements($optionWrapper)
      createOptionElements(newItems, $origin)
      showMessageText(!newItems.length)
    }
  })

  // Close dropdown if escape key has been pressed
  document.addEventListener('keyup', (event) => {
    const isEscPressed = event.keyCode === 27

    if (isEscPressed) {
      openDropdown(false)
    }
  })

  // Close dropdown if outside has been clicked
  document.addEventListener('click', (event) => {
    const isClickOutside = !$container.contains(event.target)

    if (isClickOutside) {
      openDropdown(false)
    }
  })

  return $container
}

export default keselect
