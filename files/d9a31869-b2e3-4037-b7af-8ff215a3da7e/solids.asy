import three;
size(200);
currentprojection = orthographic((.8,1,1.2));

struct solid{

  triple[] vertices;
  path3[] faces;
  path3[] edges;

  triple[] getVs() {return this.vertices;}
  path3[] getFs() {return this.faces;}
  path3[] getEs() {return this.edges;}

  void operator init(triple[] vertices, path3[] edges, path3[] faces) {
    this.vertices = vertices; this.faces = faces; this.edges = edges;
  }
}


void draw(picture p = currentpicture,solid S, bool labelled = false,bool still = false,
                 pen[] vertexPens = array(S.vertices.length,black+4bp),
		 pen[] edgePens = array(S.edges.length,black),
		 pen[] facePens = array(S.faces.length,blue+opacity(0.5)),
		 pen labelPen = fontsize(12)){
   for(int i =0;i<S.faces.length;++i){
      if(still==false) draw(p,surface(S.faces[i]),facePens[i]);
    }
    for(int i = 0; i< S.edges.length;++i){
      draw(p,S.edges[i],edgePens[i]);
    }
    for(int i = 0; i < S.vertices.length;++i){
      triple v = S.vertices[i];
      dot(p,v,vertexPens[i]);
      if(labelled){
        string labl = "$"+string(i+1)+"$";
        label(p,labl,v,E,labelPen);
      }
    }
}


//Allows transform3s to act as expected on solids
solid operator *(transform3 t, solid S) {
  triple doitpoint(triple v) {
        return t*v;
      }
      path3 doitpath(path3 p) {
        return t*p;
      }

  triple[] verticestemp = map(doitpoint,S.vertices);
  path3[] edgestemp = map(doitpath,S.edges);
  path3[] facestemp = map(doitpath, S.faces);

  return solid(verticestemp,edgestemp,facestemp);
}

//Cube, sidelength 1, centered at origin and edges parallel to axes
struct cube {
  solid S;
  triple[] vertices;
  path3[] edges;
  path3[] faces;

  vertices.push((1,-1,-1));
  vertices.push((-1,1,-1));
  vertices.push((-1,-1,1));
  vertices.push((1,1,1));
  vertices.push((-1,1,1));
  vertices.push((1,-1,1));
  vertices.push((1,1,-1));
  vertices.push((-1,-1,-1));

  for(int i = 0; i < 2;++i){
  for(int j = 0; j < 2;++j){
    int x = (-1)^i;
    int y = (-1)^j;
    edges.push((x,y,-1)--(x,y,1));
    edges.push((x,-1,y)--(x,1,y));
    edges.push((-1,x,y)--(1,x,y));
  }}

  path3 xyFace = shift((-1,-1,-1))*(scale3(2)*unitsquare3);
  transform3 t = rotate(90,Y);
  transform3 s = rotate(90,X);

  faces.push(xyFace);
  faces.push(t*xyFace);
  faces.push(t*(t*xyFace));
  faces.push(t*(t*(t*xyFace)));
  faces.push(s*xyFace);
  faces.push(s*(s*(s*xyFace)));
  void operator init() {
    S.operator init(vertices, edges,faces); 
  }
}

//Gives a tetrahedron embedded in the cube containing (1,1,1)
struct tetrahedron {
  solid S;
  private triple[] verticees;
  private path3[] edgees;
  private path3[] facees;
  verticees.push((1,-1,-1));
  verticees.push((-1,1,-1));
  verticees.push((-1,-1,1));
  verticees.push((1,1,1));

  facees.push(verticees[0]--verticees[1]--verticees[2]--cycle);
  facees.push(verticees[0]--verticees[1]--verticees[3]--cycle);
  facees.push(verticees[0]--verticees[2]--verticees[3]--cycle);
  facees.push( verticees[1]--verticees[2]--verticees[3]--cycle);

  for(int i = 0; i<verticees.length-1; ++i){
  for(int j = i+1; j < verticees.length; ++j) {
    edgees.push(verticees[i]--verticees[j]);
  }}

  void operator init() {S.operator init(verticees, edgees, facees);}
}

solid operator cast(cube c) {return c.S;}
solid operator cast(tetrahedron t) {return t.S;}
