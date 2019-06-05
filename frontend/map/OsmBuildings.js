var Engine = false;
var state_add = false;
class OsmBuildings{
   static getButtonId(){
       return "#mdmap";
   }
   static getState(){
       return state_add;
   }
   static addEngine(){
       console.log("Add OSM Engine",OsmBuildings.getButtonId());
       additiveLayer.controller.setBaselayer("osm");
       Engine = new OSMBuildings(map).load();
       state_add=true;
   }
   static removeEngine(){
       console.log("rm OSM Engine");
       $(OsmBuildings.getButtonId()).removeClass('active');
       Engine.removeFrom(map);
       state_add=false;
    }
}