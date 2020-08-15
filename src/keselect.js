const createBaseElements = (items, $origin) => {
  const selectedIndex = $origin.selectedIndex
  const defaultItem = items[selectedIndex]
  const isPlaceholderSelected = defaultItem.value === ''

  // Create container to wrap and hide original select element
  const $container = document.createElement('div')
  $container.classList.add('keselect')

  $container.innerHTML = `
    <p class="keselect__selected">${defaultItem.label}</p>
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

  const viewportHeight = window.innerHeight
  const containerOffset = $container.offsetTop + $container.offsetHeight
  const diff = viewportHeight - containerOffset
  const position = diff > 240 ? 'bottom' : 'top'

  $dropdown.classList.add(`keselect__dropdown--${position}`)
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

  createBaseElements(items, $origin)

  const $container = $origin.parentElement
  const $dropdown = $container.querySelector('.keselect__dropdown')
  const $search = $container.querySelector('.keselect__search')
  const $emptyWrapper = $container.querySelector('.keselect__empty-wrapper')
  const $optionWrapper = $container.querySelector('.keselect__option-wrapper')

  createOptionElements(items, $origin, () => {
    isOpen = false
  })

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    if (isOpen) {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')
    } else {
      $dropdown.classList.remove('keselect__dropdown--hide')
      $dropdown.classList.add('keselect__dropdown--show')

      $emptyWrapper.classList.remove('keselect__empty-wrapper--show')
      $emptyWrapper.classList.add('keselect__empty-wrapper--hide')

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

    const newItems = items.filter(item => {
      const keyword = event.target.value
      const pattern = new RegExp(keyword, 'ig')

      return pattern.test(item.label)
    })

    if (!newItems.length) {
      $emptyWrapper.classList.add('keselect__empty-wrapper--show')
      $emptyWrapper.classList.remove('keselect__empty-wrapper--hide')
    } else {
      $emptyWrapper.classList.add('keselect__empty-wrapper--hide')
      $emptyWrapper.classList.remove('keselect__empty-wrapper--show')
    }

    $options.forEach($option => $option.remove())

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

      isOpen = false
    }
  })

  // Close dropdown if outside has been clicked
  document.addEventListener('click', (event) => {
    const isClickOutside = !$container.contains(event.target)

    if (isClickOutside) {
      $dropdown.classList.remove('keselect__dropdown--show')
      $dropdown.classList.add('keselect__dropdown--hide')

      isOpen = false
    }
  })

  return $container
}

export default keselect
