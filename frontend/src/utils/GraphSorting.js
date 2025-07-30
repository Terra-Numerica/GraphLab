export const ColorGraphSort = (data) => {
    return data.filter((graph) =>
        graph.tag.includes("COL")
    );
}

export const TSPGraphSort = (data) => {
    return data.filter((graph) =>
        graph.tag.includes("TSP")
    );
}

export const PenroseGraphSort = (data) => {
    return data.filter((graph) =>
        graph.tag.includes("PEN")
    );
}

