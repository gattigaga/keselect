import './styles.css'

const keselect = ($origin) => {
  let selectedIndex = $origin.selectedIndex
  let isOpen = false

  // Get options data from inside original select element
  const items = Object.values($origin.options).map($option => ({
    label: $option.label,
    value: $option.value
  }))

  const defaultItem = items[selectedIndex]
  const isPlaceholderSelected = defaultItem.value === ''

  // Create container to wrap and hide original select element
  const $container = document.createElement('div')
  $container.classList.add('keselect')
  $origin.parentNode.insertBefore($container, $origin)
  $container.appendChild($origin)

  // Create content element that contains options
  const $selected = document.createElement('p')
  $selected.classList.add('keselect__selected')
  $selected.textContent = defaultItem.label

  if (isPlaceholderSelected) {
    $selected.classList.add('keselect__selected--placeholder')
  }

  $container.appendChild($selected)

  // Create content element that contains options
  const $content = document.createElement('div')
  $content.classList.add('keselect__content', 'keselect__content--hide')
  $container.appendChild($content)

  // Create options element inside content element
  items.forEach(item => {
    const $option = document.createElement('div')
    $option.classList.add('keselect__option')
    $option.dataset.label = item.label
    $option.dataset.value = item.value
    $content.appendChild($option)

    const $label = document.createElement('p')
    $label.textContent = item.label
    $option.appendChild($label)
  })

  const $options = $content.querySelectorAll('.keselect__option')

  // Make container able to toggle open/close when clicked
  $container.addEventListener('click', () => {
    if (isOpen) {
      $content.classList.remove('keselect__content--show')
      $content.classList.add('keselect__content--hide')
    } else {
      $content.classList.remove('keselect__content--hide')
      $content.classList.add('keselect__content--show')
    }

    isOpen = !isOpen
  })

  $options.forEach(($option, index) => {
    $option.addEventListener('click', () => {
      const { label, value } = $option.dataset
      const isPlaceholderSelected = value === ''

      $selected.classList.remove('keselect__selected--placeholder')
      $options[selectedIndex].classList.remove('keselect__option--selected')
      $option.classList.add('keselect__option--selected')

      if (isPlaceholderSelected) {
        $selected.classList.add('keselect__selected--placeholder')
      }

      $selected.textContent = label
      $origin.selectedIndex = index
      selectedIndex = index
    })
  })
}

export default keselect
