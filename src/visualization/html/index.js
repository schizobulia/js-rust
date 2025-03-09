let idx = 0;
function convertToVisData(node, nodes, edges, parentId = null) {
    const id = `${node.kind}-${idx++}`;
    let label = ''
    if (node.name) {
        label = node.name.name
    } else {
        if (idx === 1) {
            label = 'Root'
        } else {
            if (node.identifiers) {
                label = node.identifiers.map(identifier => identifier.name).join(', ')
            } else {
                label = node.kind
            }
        }
    }
    nodes.push({ id: id, label: label });
    if (parentId !== null) {
        edges.push({ from: parentId, to: id });
    }
    node.child.forEach(child => {
        convertToVisData(child, nodes, edges, id);
    });
    if (Array.isArray(node.body)) {
        node.body.forEach(child => {
            convertToVisData(child, nodes, edges, id);
        });
    }
}

let nodes = [];
let edges = [];
convertToVisData(rootNode, nodes, edges);
const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
};

const container = document.getElementById('network');
const options = {
    edges: {
        arrows: {
            to: { enabled: true }
        }
    },
    layout: {
        hierarchical: {
            direction: 'UD',
            sortMethod: 'directed'
        }
    }
};

const network = new vis.Network(container, data, options);