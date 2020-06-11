var authToken;
const linkVisiblity = {mention: true}
var Graph;
var data;
function auth(){
    var step1 = document.getElementById("step1");
    var step2 = document.getElementById("step2");

    authToken = document.getElementById("authToken").value
    fetch("/api/user", {headers:{"x-auth-token": authToken}})
        .then(x => x.json())
        .then(x => {            
            step2.innerHTML = "";
            for(let world of x.worlds){
                var div = document.createElement("div");
                var header = document.createElement("h3");
                header.textContent = world.name;
                var button = document.createElement("button");
                button.classList.add("btn", "btn-primary");
                button.textContent = "Select";
                button.onclick = () => graph(world.id);
                div.appendChild(header);
                div.appendChild(button);
                step2.appendChild(div);
            }
            step1.hidden = true;
            step2.hidden = false;
        });
    return false;
}

function createFilter(){
  var nodegroups = new Set(data.nodes.map(x => x.group));
  var options = document.getElementById("nodeOptions");
  options.innerHTML = "";
  for(let group of nodegroups){
    var span = document.createElement("span");
    span.classList.add("form-check");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("form-check-input", "filter-input-node");
    input.id = group;
    input.checked = true;
    var label = document.createElement("label");
    label.classList.add("form-check-label");
    label.for = group;
    label.textContent = group;
    span.appendChild(input);
    span.appendChild(label);
    options.appendChild(span);
  }
  var nodegroups = new Set(data.links.map(x => x.group));
  for(let group of nodegroups){
    var span = document.createElement("span");
    span.classList.add("form-check");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("form-check-input", "filter-input-links");
    input.id = group;
    input.checked = true;
    var label = document.createElement("label");
    label.classList.add("form-check-label");
    label.for = group;
    label.textContent = group;
    span.appendChild(input);
    span.appendChild(label);
    options.appendChild(span);
  }
}

function applyFilter(){
  const nodeFilters = {};
  const linkFilters = {};
  var checkboxes = document.getElementsByClassName("filter-input-node");
  for(var i=0; i<checkboxes.length; i++){
    nodeFilters[checkboxes[i].id] = checkboxes[i].checked
  }
  var checkboxes = document.getElementsByClassName("filter-input-links");
  for(var i=0; i<checkboxes.length; i++){
    linkFilters[checkboxes[i].id] = checkboxes[i].checked
  }
  console.log(nodeFilters);
  const {nodes, links} = data;
  Graph.graphData({nodes:nodes.filter(x => nodeFilters[x.group]), links:links.filter(x => nodeFilters[x.source.group] && nodeFilters[x.target.group] && linkFilters[x.group])});
}

function graph(worldId){
  var step2 = document.getElementById("step2");
  var step3 = document.getElementById("step3");
  
  step2.hidden = true;
  step3.hidden = false;        
  fetch("/api/world/" + worldId, {headers:{"x-auth-token": authToken}})
      .then(x => x.json())
      .then(x => {
        data = x;
        createFilter();
        var wrapper = document.getElementById("wrapper");       
        wrapper.hidden = true;
        step3.hidden = true;
        Graph = ForceGraph3D()
        (document.getElementById('mynetwork'))
        //.nodeLabel('name')
        .graphData(x)
        .nodeAutoColorBy('group')    
        .linkAutoColorBy('group')    
        .linkDirectionalArrowLength(3.5)
        .linkCurvature(0.1)
        .linkWidth(link => link.group === "mention"?0:1)
        //.nodeVal(node => node.wordcount)
        .linkDirectionalArrowRelPos(1)
        .linkVisibility(link => (link.group in linkVisiblity?linkVisiblity[link.group]:true))
        .nodeThreeObject(node => {
          console.log(node)
          // use a sphere as a drag handle
          const obj = new THREE.Mesh(
            new THREE.SphereGeometry(15),
            new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
          );

          // add text sprite as child
          const sprite = new SpriteText(node.name);
          sprite.color = node.color;
          sprite.textHeight = Math.max(2, 10 * (Math.min(node.wordcount, 1000) / 1000));
          obj.add(sprite);

          return obj;
        })
        //.onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
          // Aim at node from outside it
          const distance = 200;
          const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

          Graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
          );
        });
      }); 
      Graph.d3Force('link').distance(link => link.group === "mention" ? 400: 40).d3Force('charge').strength(-120);
}