var authToken;


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
                var header = document.createElement("h1");
                header.textContent = world.name;
                var button = document.createElement("button");
                button.classList.add("btn", "btn-primary");
                button.textContent = "Select";
                button.onclick = () => graph(world.id);
                div.appendChild(header);
                div.appendChild(button);
                step2.appendChild(div);
            }
        });
    return false;
}


function graph(worldId){
  console.log(worldId);
    var wrapper = document.getElementById("wrapper");
    wrapper.hidden = true;
    fetch("/api/world/" + worldId, {headers:{"x-auth-token":authToken}})
        .then(x => x.json())
        .then(x => {
          console.log(x);
          const Graph = ForceGraph3D()
      (document.getElementById('mynetwork'))
        //.nodeLabel('name')
        .graphData(x)
        .nodeAutoColorBy('group')    
        .linkAutoColorBy('group')    
        .linkDirectionalArrowLength(3.5)
        .linkCurvature(0.25)
      .linkDirectionalArrowRelPos(1)
        .nodeThreeObject(node => {
          // use a sphere as a drag handle
          const obj = new THREE.Mesh(
            new THREE.SphereGeometry(5),
            new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0.1 })
          );

          // add text sprite as child
          const sprite = new SpriteText(node.name);
          sprite.color = node.color;
          sprite.textHeight = 5;
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
    
    
}