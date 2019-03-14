const upward_class="upward";
class MenuHelper{
    static setUpward(elem){
        elem.addClass(upward_class);
    }
    static removeUpward(elem){
        elem.removeClass(upward_class);
    }
}