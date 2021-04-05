// ---- Define your dialogs  and panels here ----
// STUDIO ---------------------------
var effective_permissions_panel = define_new_effective_permissions('e_p_panel', true, null)
$('#sidepanel').append(effective_permissions_panel)

var user_select_field = define_new_user_select_field('u_s_field', 'select_button_text', function(selected_user){
    // HARDCODED FILEPATH (can probably change by figuring out which element is associated with the locks
    // and then doing the attr thing to set the filepath to whatever the lock's filepath is)
    $('#e_p_panel').attr('filepath', '/C/Lecture_Notes/Lecture1.txt')
    $('#e_p_panel').attr('username', selected_user)})
$('#sidepanel').prepend(user_select_field)

var new_dialog = define_new_dialog('n_dialog', title='', options = {})
$('.perm_info').click(function(){
    console.log('clicked!')
    new_dialog.dialog('open')
    new_dialog.empty()

    var filepath = $('#e_p_panel').attr('filepath')
    var username = $('#e_p_panel').attr('username')
    var perm_name = $(this)
    console.log(filepath)
    console.log(username)
    console.log(perm_name)

    var file_object = path_to_file[filepath]
    var user_object = all_users[username]
    var is_user_action_allowed = allow_user_action(file_object, user_object, perm_name, true)
    var readable_is_user_action_allowed = get_explanation_text(is_user_action_allowed)

    new_dialog.append(username)
    new_dialog.append("<br>")
    new_dialog.append("<br>")
    new_dialog.append(filepath)
    new_dialog.append("<br>")
    new_dialog.append("<br>")
    new_dialog.append(readable_is_user_action_allowed)
})

// allow_user_action(file, user, permission_to_check, explain_why = false)





// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 