function ChatTree(element) {
    let itemsArray
    let activeElement

    element.onclick = event => {
        event.stopPropagation()
        console.log('onclick', event)
        const srcElement = event.srcElement
        if (srcElement.localName === 'li') {
            setActiveElement(srcElement)
        }
    }
    element.ondblclick = event => {
        event.stopPropagation()
        console.log('ondblclick', event)
        const srcElement = event.srcElement
        if (srcElement.localName === 'li' && srcElement.dataset.type === 'group') {
            setActiveElement(srcElement)
            toggleGroup(srcElement)
        }
    }

    element.onkeydown = event => {
        event.stopPropagation()
        console.log('onkeydown', event)
        switch (event.key) {
            case 'ArrowUp':
                if (activeElement.previousSibling) setActiveElement(activeElement.previousSibling)
                break
            case 'ArrowDown':
                if (activeElement.nextSibling) setActiveElement(activeElement.nextSibling)
                break
            case 'ArrowRight':
                if (activeElement.dataset.type === 'group') {
                    expandGroup(activeElement)
                }
                break
            case 'ArrowLeft':
                if (activeElement.dataset.type !== 'group' || !activeElement.dataset.expanded) {
                    const parentGroup = getGroupOfElement(activeElement)
                    setActiveElement(parentGroup || element.firstChild)
                } else {
                    foldGroup(activeElement)
                }
                break
            case 'Enter':
                if (activeElement.dataset.type === 'group') {
                    toggleGroup(activeElement)
                }
                break
        }
    }

    function toggleGroup(groupElement) {
        if (groupElement.dataset.expanded) {
            foldGroup(groupElement)
        } else {
            expandGroup(groupElement)
        }
    }
    function expandGroup(groupElement) {
        if (groupElement.dataset.expanded) return
        const groupElementPosition = groupElement.dataset.position
        const groupItem = getItemByPosition(groupElementPosition)
        groupItem.items.forEach((item, index) => addListItem(item, `${groupElementPosition},${index}`, groupElement))
        groupElement.dataset.expanded = 't'
    }
    function foldGroup(groupElement) {
        const groupElementPosition = groupElement.dataset.position
        let currElement = groupElement.nextSibling
        while (currElement && currElement.dataset.position.startsWith(groupElementPosition)) { // TODO: external function
            const nextElement = currElement.nextSibling
            element.removeChild(currElement)
            currElement = nextElement
        }
        groupElement.dataset.expanded = ''
    }

    function getItemByPosition(position) {
        return _getItem(itemsArray, ...position.split(','))

        function _getItem(items, index, ...positionArray) {
            if (!positionArray.length) {
                return items[index]
            }
            return _getItem(items[index].items, ...positionArray)
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
        activeElement && activeElement.classList.remove("active")
        toActiveElement.classList.add("active")
        activeElement = toActiveElement
    }

    function addListItem(item, position, addAfter) {
        const li = document.createElement("li")
        const node = document.createTextNode(item.name)
        li.setAttribute("tabindex", "-1")
        li.appendChild(node)

        position = position.toString()
        li.dataset.position = position

        const level = position.split(",").length - 1
        li.setAttribute('style', `padding-left: ${(level + 0.5) * 1}em`)

        li.dataset.type = item.type
        if (item.type === 'group') {
            li.dataset.expanded = ''
        }

        element.insertBefore(li, addAfter && addAfter.nextSibling)

    }

    function load(items) {
        itemsArray = items
        items.forEach((item, index) => addListItem(item, index))
        setActiveElement(element.firstChild)
    }
    function clear() {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }
    return {
        load,
        clear,
        element,
    };
}
