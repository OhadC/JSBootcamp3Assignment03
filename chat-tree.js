function ChatTree(element) {
    let focusedItem;

    element.onfocus = () => {
        setFocusedItem()
    }
    element.onclick = () => {
        setFocusedItem(document.activeElement)
    }
    element.onkeydown = e => {
        console.log('onkeydown', e)
        switch (e.key) {
            case 'ArrowUp':
                if (focusedItem.previousSibling) setFocusedItem(focusedItem.previousSibling)
                break
            case 'ArrowDown':
                if (focusedItem.nextSibling) setFocusedItem(focusedItem.nextSibling)
                break
            case 'ArrowLeft':
                break
            case 'ArrowRight':
                break
        }
    }

    function toggleChildrens(item, bool) {

    }

    function setFocusedItem(nextItem) {
        focusedItem = nextItem || focusedItem
        if(focusedItem) focusedItem.focus()
    }

    function load(items) {
        items.forEach(item => {
            const li = document.createElement("li")
            const node = document.createTextNode(item.name)
            li.setAttribute("tabindex", "-1")
            li.appendChild(node)
            li.dataset.type = item.type
            // li.dataset.parent = parent || root
            if (item.items) li.dataset.childrens = item.items
            element.appendChild(li)
        })
        focusedItem = element.firstChild
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
