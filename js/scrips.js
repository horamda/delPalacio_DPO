document.addEventListener("DOMContentLoaded", function() {
    var tabs = document.querySelectorAll(".tab-link");
    var contents = document.querySelectorAll(".tab-content");

    tabs.forEach(function(tab) {
        tab.addEventListener("click", function() {
            var tab_id = this.getAttribute("data-tab");

            tabs.forEach(function(item) {
                item.classList.remove("active");
            });

            contents.forEach(function(content) {
                content.classList.remove("active");
            });

            this.classList.add("active");
            document.getElementById(tab_id).classList.add("active");
        });
    });
});
