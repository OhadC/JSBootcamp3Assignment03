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
        if (srcElement.localName === 'li' && isGroup(srcElement)) {
            toggleGroup(srcElement)
        }
    }

    element.onkeydown = event => {
        event.stopPropagation()
        if (!activeElement) return
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
                if (isGroup(activeElement) && isGroupExpanded(activeElement)) {
                    foldGroup(activeElement)
                } else {
                    const parentGroup = getGroupOfElement(activeElement)
                    setActiveElement(parentGroup || element.firstChild)
                }
                break
            case 'Enter':
                if (isGroup(activeElement)) toggleGroup(activeElement)
                break
        }
    }

    function setActiveElement(toActiveElement) {
        if (activeElement === toActiveElement) return
        activeElement && activeElement.classList.remove("active")
        toActiveElement.classList.add("active")
        activeElement = toActiveElement
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
        const groupItem = groupElement.item
        const groupLevel = +(groupElement.dataset.level)
        const addListItemsBefore = groupElement.nextSibling
        groupItem.items.forEach((item, index) => addListItem(item, groupItem, groupLevel + 1, addListItemsBefore))
        setGroupExpanded(groupElement, true)
    }
    function foldGroup(groupElement) {
        if (!isGroupExpanded(groupElement)) return
        let currElement = groupElement.nextSibling
        while (isGroupOf(groupElement, currElement)) {
            if (isGroup(currElement) && isGroupExpanded(currElement)) {
                foldGroup(currElement)
            } else {
                const nextElement = currElement.nextSibling
                element.removeChild(currElement)
                currElement = nextElement
            }
        }
        setGroupExpanded(groupElement, false)
    }

    function addListItem(item, parent, level, addBefore) {
        level = level || 0

        const li = document.createElement("li")
        const textNode = document.createTextNode(item.name)
        li.appendChild(textNode)
        li.setAttribute('style', `padding-left: ${(level + 0.5) * 1}em`)
        li.dataset.level = level
        if (item.type === 'group') {
            li.setAttribute('group', '')
        }

        li.item = item
        li.parentItem = parent

        element.insertBefore(li, addBefore)
    }

    function isGroup(elem) {
        return elem.hasAttribute('group')
    }
    function isGroupExpanded(groupElem) {
        return groupElem.hasAttribute('expanded')
    }
    function setGroupExpanded(groupElem, isExpanded) {
        isExpanded ? groupElem.setAttribute('expanded', '') : groupElem.removeAttribute('expanded')
    }
    function isGroupOf(groupElem, childElem) {
        return childElem.parentItem === groupElem.item
    }
    function getGroupOfElement(childElement) {
        const parentItem = childElement.parentItem
        for (let currSibling = childElement.previousSibling; currSibling; currSibling = currSibling.previousSibling) {
            if (currSibling.item === parentItem) {
                return currSibling
            }
        }
        return null
    }

    function load(items) {
        clear()
        itemsArray = items
        items.forEach(item => addListItem(item, null))
        setActiveElement(element.firstChild)
    }
    function clear() {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
        itemsArray = null
        activeElement = null
    }
    return {
        load,
        clear,
        element,
    }
}
