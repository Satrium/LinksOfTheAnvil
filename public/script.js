var authToken;
const linkVisiblity = {mention: true}
var Graph;

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


function graph(worldId){
  var step2 = document.getElementById("step2");
  var step3 = document.getElementById("step3");
  step2.hidden = true;
  step3.hidden = false;        
  fetch("/api/world/" + worldId, {headers:{"x-auth-token": authToken}})
      .then(x => x.json())
      .then(x => {
        console.log(x);
        var maxWordCount = -1;
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
      Graph.d3Force('charge').strength(-120);
}