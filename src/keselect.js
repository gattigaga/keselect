import { debounce } from 'debounce'

const createBaseElements = (items, $origin) => {
  const defaultItem = items[$origin.selectedIndex]
  const isPlaceholderSelected = defaultItem ? defaultItem.value === '' : false
  const selectedLabel = defaultItem ? defaultItem.label : ''

  // Create container to wrap and hide original select element
  const $container = document.createElement('div')
  $container.classList.add('keselect')

  $container.innerHTML = `
    <div class="keselect__selected-wrapper">
      <p class="keselect__selected">${selectedLabel}</p>
      <span class="keselect__arrow">&dtrif;</span>
    </div>
    <div class="keselect__dropdown keselect__dropdown--hide">
      <div class="keselect__search-wrapper">
        <input class="keselect__search" type="text" value="" />
      </div>
      <div class="keselect__empty-wrapper keselect__empty-wrapper--hide">
        <p class="keselect__empty">No data available</p>
      </div>
      <div class="keselect__option-wrapper"></div>
    </div>
  `

  const $selected = $container.querySelector('.keselect__selected')
  const $dropdown = $container.querySelector('.keselect__dropdown')

  $origin.parentNode.insertBefore($container, $origin)
  $container.prepend($origin)

  if (isPlaceholderSelected) {
    $selected.classList.add('keselect__selected--placeholder')
  }

  // Set dropdown open position based on container position
  const viewportHeight = window.innerHeight
  const containerOffset = $container.offsetTop + $container.offsetHeight
  const diff = viewportHeight - containerOffset
  const position = diff > 240 ? 'bottom' : 'top'

  $dropdown.classList.add(`keselect__dropdown--${position}`)
}

const createOptionElements = (items, $origin) => {
  const $container = $origin.parentElement
  const $selected = $container.querySelector('.keselect__selected')
  const $dropdown = $container.querySelector('.keselect__dropdown')
  const $optionWrapper = $container.querySelector('.keselect__option-wrapper')

  $optionWrapper.innerHTML = `
    ${items.map(item => {
      const { index, label, value } = item
      const isSelected = item.index === $origin.selectedIndex
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
      $origin.selectedIndex = index

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

const createToggleEmptyText = ($emptyWrapper) => (isShow) => {
  if (isShow) {
    $emptyWrapper.classList.remove('keselect__empty-wrapper--hide')
    $emptyWrapper.classList.add('keselect__empty-wrapper--show')
  } else {
    $emptyWrapper.classList.remove('keselect__empty-wrapper--show')
    $emptyWrapper.classList.add('keselect__empty-wrapper--hide')
  }
}

const removeOptionElements = ($optionWrapper) => {
  $optionWrapper
    .querySelectorAll('.keselect__option')
    .forEach($option => $option.remove())
}

const keselect = ($origin, options = {}) => {
  const isValidElement = $origin instanceof HTMLElement

  if (!isValidElement) {
    console.error('Passed element is not a valid HTML element.')
    return
  }

  const { fetchItems } = options

  // Get options data from inside original select element
  const items = Object.values($origin.options).map(($option, index) => ({
    index,
    label: $option.label,
    value: $option.value
  }))

  createBaseElements(items, $origin)

  const $container = $origin.parentElement
  const $dropdown = $container.querySelector('.keselect__dropdown')
  const $search = $container.querySelector('.keselect__search')
  const $emptyWrapper = $container.querySelector('.keselect__empty-wrapper')
  const $empty = $container.querySelector('.keselect__empty')
  const $optionWrapper = $container.querySelector('.keselect__option-wrapper')

  if (fetchItems) {
    $empty.textContent = 'Enter a keyword to find options'
  }

  createOptionElements(items, $origin)

  const openDropdown = createToggleDropdown($dropdown)
  const showEmptyText = createToggleEmptyText($emptyWrapper)

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    const isDropdownOpen = $dropdown.classList.contains('keselect__dropdown--show')

    openDropdown(!isDropdownOpen)

    if (!isDropdownOpen) {
      $search.value = ''

      showEmptyText(!items.length)
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

    if (fetchItems) {
      if (keyword.length >= 1) {
        $empty.textContent = 'Searching...'

        showEmptyText(true)
        removeOptionElements($optionWrapper)

        const runFetchItems = () => {
          fetchItems(keyword, (items) => {
            $empty.textContent = 'No data available'

            removeOptionElements($optionWrapper)
            createOptionElements(items, $origin)
            showEmptyText(!items.length)
          })
        }

        debounce(runFetchItems, 500)()
      } else {
        $empty.textContent = 'Enter a keyword to find options'

        removeOptionElements($optionWrapper)
        showEmptyText(true)
      }
    } else {
      const newItems = items.filter(item => {
        const pattern = new RegExp(keyword, 'ig')

        return pattern.test(item.label)
      })

      removeOptionElements($optionWrapper)
      createOptionElements(newItems, $origin)
      showEmptyText(!newItems.length)
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
