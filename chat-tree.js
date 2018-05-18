function ChatTree(element) {
    let itemsArray
    let activeElement

    function setActiveElement(toActiveElement) {
        if (activeElement === toActiveElement) return
        activeElement && activeElement.classList.remove("active")
        toActiveElement.classList.add("active")
        activeElement = toActiveElement
    }

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
        if (srcElement.localName === 'li' && isGroup(srcElement)) {
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
                if (isGroup(activeElement)) expandGroup(activeElement)
                break
            case 'ArrowLeft':
                if (!isGroup(activeElement) || !isGroupExpanded(activeElement)) {
                    const parentGroup = getGroupOfElement(activeElement)
                    setActiveElement(parentGroup || element.firstChild)
                } else {
                    foldGroup(activeElement)
                }
                break
            case 'Enter':
                if (isGroup(activeElement)) toggleGroup(activeElement)
                break
        }
    }

    function toggleGroup(groupElement) {
        if (isGroupExpanded(groupElement)) {
            foldGroup(groupElement)
        } else {
            expandGroup(groupElement)
        }
    }
    function expandGroup(groupElement) {
        if (isGroupExpanded(groupElement)) return
        const groupElementPosition = groupElement.dataset.position
        const groupItem = getItemByPosition(groupElementPosition)
        const addListItemsBefore = groupElement.nextSibling
        groupItem.items.forEach((item, index) => addListItem(item, `${groupElementPosition},${index}`, addListItemsBefore))
        setGroupExpanded(groupElement, true)
    }
    function foldGroup(groupElement) {
        if (!isGroupExpanded(groupElement)) return
        let currElement = groupElement.nextSibling
        while (isGroupOf(groupElement, currElement)) {
            const nextElement = currElement.nextSibling
            element.removeChild(currElement)
            currElement = nextElement
        }
        setGroupExpanded(groupElement, false)
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

    function isGroup(elem) {
        return elem.dataset.type === 'group'
    }
    function isGroupExpanded(groupElem) {
        return groupElem.hasAttribute('expanded')
    }
    function setGroupExpanded(groupElem, isExpanded) {
        isExpanded ? groupElem.setAttribute('expanded', '') : groupElem.removeAttribute('expanded')
    }
    function isGroupOf(groupElem, childElem) {
        const groupElemPosition = groupElem.dataset.position
        return childElem && childElem.dataset.position.startsWith(groupElemPosition)
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
    function getItemByPosition(position) {
        return _getItem(itemsArray, ...position.split(','))

        function _getItem(items, index, ...rest) {
            if (!rest.length) {
                return items[index]
            }
            return _getItem(items[index].items, ...rest)
        }
    }

    function load(items) {
        clear()
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
    }
}
