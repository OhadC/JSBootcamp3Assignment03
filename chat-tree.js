function ChatTree(element) {
    let itemsArray
    let activeElement

    element.onclick = event => {
        event.stopPropagation()
        const srcElement = event.srcElement
        if (srcElement.localName === 'li') {
            setActiveElement(srcElement)
        }
    }
    element.ondblclick = event => {
        event.stopPropagation()
        const srcElement = event.srcElement
        if (srcElement.localName === 'li' && srcElement.dataset.type === 'group') {
            toggleGroup(srcElement)
        }
    }

    element.onkeydown = event => {
        event.stopPropagation()
        switch (event.key) {
            case 'ArrowUp':
                if (activeElement.previousSibling) setActiveElement(activeElement.previousSibling)
                break
            case 'ArrowDown':
                if (activeElement.nextSibling) setActiveElement(activeElement.nextSibling)
                break
            case 'ArrowRight':
                if (activeElement.dataset.type === 'group') expandGroup(activeElement)
                break
            case 'ArrowLeft':
                if (activeElement.dataset.type !== 'group' || !activeElement.hasAttribute('expanded')) {
                    const parentGroup = getGroupOfElement(activeElement)
                    setActiveElement(parentGroup || element.firstChild)
                } else {
                    foldGroup(activeElement)
                }
                break
            case 'Enter':
                if (activeElement.dataset.type === 'group') toggleGroup(activeElement)
                break
        }
    }

    function toggleGroup(groupElement) {
        if (groupElement.hasAttribute('expanded')) {
            foldGroup(groupElement)
        } else {
            expandGroup(groupElement)
        }
    }
    function expandGroup(groupElement) {
        if (groupElement.hasAttribute('expanded')) return
        const groupElementPosition = groupElement.dataset.position
        const groupItem = getItemByPosition(groupElementPosition)
        const addListItemsBefore = groupElement.nextSibling
        groupItem.items.forEach((item, index) => addListItem(item, `${groupElementPosition},${index}`, addListItemsBefore))
        groupElement.setAttribute('expanded', '')
    }
    function foldGroup(groupElement) {
        let currElement = groupElement.nextSibling
        while (isGroupOf(groupElement, currElement)) { // TODO: external function
            const nextElement = currElement.nextSibling
            element.removeChild(currElement)
            currElement = nextElement
        }
        groupElement.removeAttribute('expanded')

        function isGroupOf(groupElement, childElement) {
            const groupElementPosition = groupElement.dataset.position
            return currElement && currElement.dataset.position.startsWith(groupElementPosition)
        }
    }

    function getItemByPosition(position) {
        return _getItem(itemsArray, ...position.split(','))

        function _getItem(items, index, ...rest) {
            if (!rest.length) {
                return items[index]
            }
            return _getItem(items[index].items, ...rest)
        }
    }

    function getGroupOfElement(childElement) {
        const elementPosition = childElement.dataset.position
        const parentPosition = elementPosition.split(',').slice(0, -1).join(',')
        for (let currSibling = childElement.previousSibling; currSibling; currSibling = currSibling.previousSibling) {
            if (currSibling.dataset.position === parentPosition) {
                return currSibling
            }
        }
        return null
    }

    function setActiveElement(toActiveElement) {
        if (activeElement === toActiveElement) return
        activeElement && activeElement.classList.remove("active")
        toActiveElement.classList.add("active")
        activeElement = toActiveElement
    }

    function addListItem(item, position, addBefore) {
        const li = document.createElement("li")
        const node = document.createTextNode(item.name)
        li.appendChild(node)

        position = position.toString()
        li.dataset.position = position

        const level = position.split(",").length - 1
        li.setAttribute('style', `padding-left: ${(level + 0.5) * 1}em`)

        li.dataset.type = item.type

        element.insertBefore(li, addBefore)

    }

    function load(items) {
        if (itemsArray) clear()
        itemsArray = items
        items.forEach((item, index) => addListItem(item, index))
        setActiveElement(element.firstChild)
    }
    function clear() {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
        itemsArray = null
    }
    return {
        load,
        clear,
        element,
    };
}
