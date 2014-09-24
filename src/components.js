(function (root) {
    var components = {};

    var getComponent = function (name) {
        var c = components[name];
        if (c === undefined)
            return React.DOM[name];
        return c;
    };

    var addComponent = function (name, renderFn) {
        if (typeof(renderFn) !== 'function')
            throw (new Error("Second argument must be a function."));
        if (components[name] !== undefined)
            throw (new Error("Overriding components is not allowed."));
        components[name] = React.createClass({
            render: renderFn
        });
    };

    var fn = function (name, renderFn) {
        if (renderFn === undefined)
            return getComponent(name);
        addComponent(name, renderFn);
    };

    if (typeof root.reactComponentRepository === 'undefined')
        root.reactComponentRepository = fn;
})(this);

(function (root) {
    var comp = root.reactComponentRepository,
        renderer;

   var mapToRow = function (rowData, component, options) {
        if (!rowData) return [];
        var row = rowData.map(function (current) {
            return comp(component)(
                options || {},
                comp(current.type)(current.inputs));
        });
        return row;
    };

    var mapToRows = function (rowsData, component) {
        if (!rowsData) return [];
        var rows = rowsData.map(function (current) {
            return comp(component)({rowData: current});
        });
        return rows;
    };

    var mapToListItems = function (itemsData) {
        if (!itemsData.data) return [];
        var items = itemsData.data.map(function (current) {
            return React.DOM.li({}, mapToListItem(current, itemsData.headers));
        });
        return items;
    };

    var mapToListItem = function (itemData, labels) {
        if (!itemData) return [];
        var totalLength = itemData.length - 1;
        var item = itemData.map(function (current, index) {
            var isLast = totalLength === index;
            return React.DOM.span({},
                                  [(labels ? comp(labels[index].type)(labels[index].inputs) : undefined),
                                  comp(current.type)(current.inputs),
                                  (!isLast ? React.DOM.br({}) : undefined)]);
        });
        return item;
    };


    renderer = function (component, parent) {
        return function (data, headers) {
            React.renderComponent(component({ headers: headers, data: data }), parent);
        };
    };

    renderer.VERSION = "0.1.0";

    comp('Image', function () {
        if (!this.props.src)
            this.props.src = this.props.children;
        delete this.props.children;
        return (React.DOM.img(this.props));
    });

    comp('DateTime', function () {
        var dt = new Date(this.props.children);
        this.props.children = dt.toLocaleString();
        return (React.DOM.span(this.props));
    });

    comp('TableRow', function () {
        return (React.DOM.tr({}, mapToRow(this.props.rowData, 'td')));
    });

    comp('TableHead', function () {
        return React.DOM.thead({}, React.DOM.tr({}, this.props.headers.map(function (current) { 
            return comp(current.type)(current.inputs);
        })));
    });

    comp('TableBody', function () {
        return React.DOM.tbody({}, mapToRows(this.props.data, 'TableRow'));
    });

    comp('Table', function () {
        var typedHeaders = this.props.headers.map(function (curr, i) {
            curr.type = "th";
            return curr;
        });
        return React.DOM.table({
            className: 'cabal-table'
        }, [comp('TableHead')({headers: typedHeaders}),
            comp('TableBody')({data: this.props.data})]);
    });

    comp('List', function () {
        var typedHeaders = this.props.headers.map(function (curr, i) {
            curr.type = "th";
            return curr;
        });
        return React.DOM.ul({
            className: 'cabal-list'
        }, mapToListItems({headers: typedHeaders, data: this.props.data}));
    });

    if (typeof root.cabalReactRenderer === 'undefined')
        root.cabalReactRenderer = renderer;
})(this);
