function ChatTree(element) {
    let itemsArray
    let focusedElem

    element.onfocus = () => {
        focusOnElement()
    }
    element.onclick = event => {
        event.stopPropagation()
        focusOnElement(document.activeElement)
    }
    element.ondblclick = event => {
        event.stopPropagation()
        console.log('ondblclick', event)
        const srcElement = event.srcElement
        if(srcElement.localName === 'li' && srcElement.dataset.type === 'group'){
            tuggleGroup(srcElement)
        }
    }

    element.onkeydown = e => {
        switch (e.key) {
            case 'ArrowUp':
                if (focusedElem.previousSibling) focusOnElement(focusedElem.previousSibling)
                break
            case 'ArrowDown':
                if (focusedElem.nextSibling) focusOnElement(focusedElem.nextSibling)
                break
            case 'ArrowRight':
                if (focusedElem.dataset.type === 'group') {
                    expandGroup(focusedElem)
                }
                break
            case 'ArrowLeft':
                if (focusedElem.dataset.type !== 'group' || !focusedElem.dataset.expanded) {
                    const parentGroup = getParentGroup(focusedElem)
                    if (parentGroup) {
                        focusOnElement(parentGroup)
                    } else {
                        focusOnElement(element.firstChild)
                    }
                } else {
                    foldGroup(focusedElem)
                }
                break
            case 'Enter':
                if (focusedElem.dataset.type === 'group') {
                    tuggleGroup(focusedElem)
                }
                break
        }
    }

    function tuggleGroup(groupElement) {
        if (focusedElem.dataset.expanded) {
            foldGroup(focusedElem)
        } else {
            expandGroup(focusedElem)
        }
    }
    function expandGroup(groupElement) {
        if (groupElement.dataset.expanded) return
        const elemPosition = groupElement.dataset.position
        const item = getItem(elemPosition)
        item.items.forEach((item, index) => addLi(item, `${elemPosition},${index}`, groupElement))
        groupElement.dataset.expanded = 't'
    }
    function foldGroup(groupElement) {
        const elementPosition = groupElement.dataset.position
        let currElement = groupElement.nextSibling
        while (currElement && currElement.dataset.position.startsWith(elementPosition)) { // TODO: external function
            const nextElement = currElement.nextSibling
            element.removeChild(currElement)
            currElement = nextElement
        }
        groupElement.dataset.expanded = ''
    }

    function getItem(position) {
        return _getItem(itemsArray, position.split(','))

        function _getItem(items, positionArray) {
            if (positionArray.length === 1) {
                return items[positionArray[0]]
            }
            return _getItem(items[positionArray[0]].items, positionArray.slice(1))
        }
    }

    function getParentGroup(element) {
        const elementPosition = element.dataset.position
        const parentPosition = elementPosition.split(',').slice(0, -1).join(',')
        for (let currSibling = element.previousSibling; currSibling; currSibling = currSibling.previousSibling) {
            if (currSibling.dataset.position === parentPosition) {
                return currSibling
            }
        }
        return null
    }

    function focusOnElement(elementToFocus) {
        focusedElem = elementToFocus || focusedElem
        if (focusedElem) focusedElem.focus()
    }

    function addLi(item, position, afterLi) {
        const li = document.createElement("li")
        const node = document.createTextNode(item.name)
        li.setAttribute("tabindex", "-1")
        li.appendChild(node)

        position = position.toString()
        const level = position.split(",").length - 1
        li.setAttribute('style', `padding-left: ${(level + 1) * 1}em`)

        li.dataset.position = position
        li.dataset.type = item.type
        if (item.type === 'group') {
            li.dataset.expanded = ''
        }

        if (afterLi) {
            element.insertBefore(li, afterLi.nextSibling)
        } else {
            element.appendChild(li)
        }
    }

    function load(items) {
        itemsArray = items
        items.forEach((item, index) => addLi(item, index))
        focusOnElement(element.firstChild)
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
