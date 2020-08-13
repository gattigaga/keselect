import './styles.css'

const createBaseElements = (items, $origin) => {
  const selectedIndex = $origin.selectedIndex
  const defaultItem = items[selectedIndex]
  const isPlaceholderSelected = defaultItem.value === ''

  // Create container to wrap and hide original select element
  const $container = document.createElement('div')
  $container.classList.add('keselect')
  $origin.parentNode.insertBefore($container, $origin)
  $container.appendChild($origin)

  // Create selected element that contains selected option or placeholder
  const $selected = document.createElement('p')
  $selected.classList.add('keselect__selected')
  $selected.textContent = defaultItem.label

  if (isPlaceholderSelected) {
    $selected.classList.add('keselect__selected--placeholder')
  }

  $container.appendChild($selected)

  // Create dropdown element
  const $dropdown = document.createElement('div')
  $dropdown.classList.add('keselect__dropdown', 'keselect__dropdown--hide')
  $container.appendChild($dropdown)

  // Create searchbox to find options by keyword
  const $searchWrapper = document.createElement('div')
  $searchWrapper.classList.add('keselect__search-wrapper')
  $dropdown.appendChild($searchWrapper)

  const $search = document.createElement('input')
  $search.classList.add('keselect__search')
  $searchWrapper.appendChild($search)

  // Create option wrapper element that contains option list
  const $optionWrapper = document.createElement('div')
  $optionWrapper.classList.add('keselect__option-wrapper')
  $dropdown.appendChild($optionWrapper)

  return {
    $container,
    $dropdown,
    $search,
    $optionWrapper
  }
}

const createOptionElements = (items, $origin, onClickOption) => {
  const $container = $origin.parentElement
  const $selected = $container.querySelector('.keselect__selected')
  const $dropdown = $container.querySelector('.keselect__dropdown')
  const $optionWrapper = $container.querySelector('.keselect__option-wrapper')

  // Create option elements
  items.forEach(item => {
    const $option = document.createElement('div')
    $option.classList.add('keselect__option')
    $option.dataset.index = item.index
    $option.dataset.label = item.label
    $option.dataset.value = item.value

    if (item.index === $origin.selectedIndex) {
      $option.classList.add('keselect__option--selected')
    }

    $optionWrapper.appendChild($option)

    const $label = document.createElement('p')
    $label.textContent = item.label
    $option.appendChild($label)
  })

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

      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      $selected.textContent = label
      $origin.selectedIndex = index

      onClickOption()
    })
  })
}

const keselect = ($origin) => {
  let isOpen = false

  // Get options data from inside original select element
  const items = Object.values($origin.options).map(($option, index) => ({
    index,
    label: $option.label,
    value: $option.value
  }))

  const {
    $container,
    $dropdown,
    $search,
    $optionWrapper
  } = createBaseElements(items, $origin)

  const viewportHeight = window.innerHeight
  const containerOffset = $container.offsetTop + $container.offsetHeight
  const diff = viewportHeight - containerOffset
  const position = diff > 240 ? 'bottom' : 'top'

  $dropdown.classList.add(`keselect__dropdown--${position}`)

  createOptionElements(items, $origin, () => {
    isOpen = false
  })

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    if (isOpen) {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      // Remove existing wrapper for empty text
      const $emptyWrapper = $dropdown.querySelector('.keselect__empty-wrapper')

      if ($emptyWrapper) {
        $emptyWrapper.remove()
      }
    } else {
      $dropdown.classList.remove('keselect__dropdown--hide')
      $dropdown.classList.add('keselect__dropdown--show')

      $search.value = ''

      const $options = $optionWrapper.querySelectorAll('.keselect__option')

      $options.forEach($option => $option.remove())
      createOptionElements(items, $origin, () => {
        isOpen = false
      })
    }

    isOpen = !isOpen
  })

  // Prevent event bubbling when dropdown clicked
  $dropdown.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  // Filter the options by keyword
  $search.addEventListener('keyup', (event) => {
    const $options = $optionWrapper.querySelectorAll('.keselect__option')
    const $emptyWrapper = $dropdown.querySelector('.keselect__empty-wrapper')

    const newItems = items.filter(item => {
      const keyword = event.target.value
      const pattern = new RegExp(keyword, 'ig')

      return pattern.test(item.label)
    })

    $options.forEach($option => $option.remove())

    if (!newItems.length) {
      if (!$emptyWrapper) {
        // Create wrapper for empty text
        const $emptyWrapper = document.createElement('div')
        $emptyWrapper.classList.add('keselect__empty-wrapper')
        $dropdown.appendChild($emptyWrapper)

        // Create empty text where data doesn't exists
        const $empty = document.createElement('p')
        $empty.classList.add('keselect__empty')
        $empty.textContent = 'No data available'
        $emptyWrapper.appendChild($empty)
      }
    } else {
      if ($emptyWrapper) {
        $emptyWrapper.remove()
      }
    }

    createOptionElements(newItems, $origin, () => {
      isOpen = false
    })
  })

  // Close dropdown if escape key has been pressed
  document.addEventListener('keyup', (event) => {
    const isEscPressed = event.keyCode === 27

    if (isEscPressed) {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      // Remove existing wrapper for empty text
      const $emptyWrapper = $dropdown.querySelector('.keselect__empty-wrapper')

      if ($emptyWrapper) {
        $emptyWrapper.remove()
      }

      isOpen = false
    }
  })

  // Close dropdown if outside has been clicked
  document.addEventListener('click', (event) => {
    const isClickOutside = !$container.contains(event.target)

    if (isClickOutside) {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      // Remove existing wrapper for empty text
      const $emptyWrapper = $dropdown.querySelector('.keselect__empty-wrapper')

      if ($emptyWrapper) {
        $emptyWrapper.remove()
      }

      isOpen = false
    }
  })
}

export default keselect
