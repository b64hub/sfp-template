function createChart() {
  let fontcolor = "#FFFFFF";
  let colornone = "#F9F9FB"; // 25 tint
  let colorin = "#1020F9"; // information
  let colorout = "#F06906"; // warning

  const width = 954;
  const radius = width / 2;

  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-width / 2, -width / 2, width, width])
    .attr(
      "style",
      "max-width: 100%; height: auto; font: 10px sans-serif; color: #FFFFFF;"
    );

  const line = d3
    .lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius((d) => d.y)
    .angle((d) => d.x);

  d3.json("../assets/data/sfdx-project.json")
    .then(function (project) {
      // Reformat the data
      const data = packageHierarchy(project);

      const cluster = d3.cluster().size([2 * Math.PI, radius - 100]);
      const root = cluster(bilink(data));

      // Build an object that gives feature of each leaves
      var leaves = root.leaves();

      // Leaves is an array of Objects. 1 item = one leaf. Provides x and y for leaf position in the svg. Also gives details about its parent.
      const link = svg
        .append("g")
        .attr("stroke", colornone)
        .attr("fill", "none")
        .selectAll()
        .data(root.leaves().flatMap((leaf) => leaf.outgoing))
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))
        .each(function (d) {
          d.path = this;
        });

      function overed(event, d) {
        link.style("mix-blend-mode", null);
        d3.select(this).attr("font-weight", "bold");
        d3.selectAll(d.incoming.map((d) => d.path))
          .attr("stroke", colorin)
          .raise();
        d3.selectAll(d.incoming.map(([d]) => d.text))
          .attr("fill", colorin)
          .attr("font-weight", "bold");
        d3.selectAll(d.outgoing.map((d) => d.path))
          .attr("stroke", colorout)
          .raise();
        d3.selectAll(d.outgoing.map(([, d]) => d.text))
          .attr("fill", colorout)
          .attr("font-weight", "bold");
      }

      function outed(event, d) {
        link.style("mix-blend-mode", "multiply");
        d3.select(this).attr("font-weight", null);
        d3.selectAll(d.incoming.map((d) => d.path)).attr("stroke", null);
        d3.selectAll(d.incoming.map(([d]) => d.text))
          .attr("fill", fontcolor)
          .attr("font-weight", null);
        d3.selectAll(d.outgoing.map((d) => d.path)).attr("stroke", null);
        d3.selectAll(d.outgoing.map(([, d]) => d.text))
          .attr("fill", fontcolor)
          .attr("font-weight", null);
      }

      const node = svg
        .append("g")
        .selectAll()
        .data(root.leaves())
        .join("g")
        .attr(
          "transform",
          (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
        )
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => (d.x < Math.PI ? 6 : -6))
        .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
        .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
        .text((d) => d.data.name)
        .each(function (d) {
          d.text = this;
        })
        .on("mouseover", overed)
        .on("mouseout", outed)
        .call((text) =>
          text.append("title").text(
            (d) => `${d.data.name}
                    ${d.outgoing.length} outgoing
                    ${d.incoming.length} incoming`
          )
        );
    })
    .catch(function (error) {
      console.error("Error loading the JSON data:", error);
    });
}

function packageHierarchy(project) {
  const packages = getPackages(project);
  const paths = pathHierarchy(packages);

  return d3.hierarchy(paths);
}

function getPackages(project) {
  const packageMap = new Map();

  for (const [alias, packageId] of Object.entries(project.packageAliases)) {
    let type;
    if (packageId.startsWith("04t")) {
      type = "managed";
      path = alias;
    } else {
      type = "unlocked";
    }

    const packageDef = { type, name: alias, packageId, dependants: [], path };
    packageMap.set(alias, packageDef);
  }

  project.packageDirectories.forEach((packageDefinition) => {
    const { package, dependencies, packageId } = packageDefinition;

    if (!packageMap.has(package)) {
      let type;
      if (!packageDefinition.type) {
        type = "source";
      } else {
        type = packageDefinition.type;
      }

      packageMap.set(package, { type, name: package, dependants: [] });
    }

    const packageDef = packageMap.get(package);
    Object.assign(packageDef, packageDefinition);

    if (dependencies) {
      dependencies.forEach((dependency) => {
        packageMap.get(dependency.package).dependants.push(packageDef);
      });
    }
  });

  return Array.from(packageMap.values());
}

function pathHierarchy(data, delimiter = "/") {
  let root = { name: "root", children: [] };
  const map = new Map();

  data.forEach(function find(data) {
    let { path } = data;
    path = path.startsWith("./") ? path.slice(2) : path;

    if (map.has(path)) return map.get(path);

    const i = path.lastIndexOf(delimiter);
    map.set(path, data);
    if (i >= 0) {
      find({ path: path.substring(0, i), children: [] }).children.push(data);
      data.path = path.substring(i + 1);
    } else {
      root.children.push(data);
    }
    return data;
  });

  return root;
}

function bilink(root) {
  const map = new Map(root.leaves().map((d) => [d.data.name, d]));

  for (const d of root.leaves()) {
    d.incoming = [];
    if (d.data.dependencies) {
      d.outgoing = d.data.dependencies.map((dependency) => [
        d,
        map.get(dependency.package)
      ]);
    } else {
      d.outgoing = [];
    }
  }

  for (const d of root.leaves()) {
    for (const o of d.outgoing) {
      o[1].incoming.push(o);
    }
  }

  return root;
}

document.addEventListener("DOMContentLoaded", createChart);
