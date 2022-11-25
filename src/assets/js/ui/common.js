const itemIndex = a => {
    let items = [...a.parentElement.children];
    return items.indexOf(a);
};

const insertAfter = (a, b) => {
    a.parentElement.insertBefore(b, a.nextSibling);
};