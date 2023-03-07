// exports = module.exports = function(io){
  export default function (io){
    var pdfInfo = {
        pdfStatus: 0,
        pdfId: "",
      };
      
      var current_student_permission = "";
      var zoom_pdf = 1;
      var scroll_position = {
        ratioX: null,
        ratioY: null,
      };
    io.on("connection", (socket) => {
        //console.log("A user connected");
      
        //-----------PDF FILE CHOSEN---------------
        socket.emit("get-pdf-status", pdfInfo);
      
        socket.on("pdf-status", (pobject) => {
          //pdfStatus = pobject.status;
          pdfInfo = {
            pdfStatus: pobject.status,
            pdfId: pobject.pdfId,
          };
          zoom_pdf = 1;
          scroll_position = {
            ratioX: null,
            ratioY: null,
          };
          //console.log(pdfInfo);
          io.emit("pdf", pdfInfo);
        });
      
//-----------------------PERMISSION----------------
        socket.on("allowance", (role) => {
          console.log(role);
          current_student_permission = role;
          //socket.emit('pdf',pdf)
          io.emit("set-role", role);
      
          // io.emit('')
        });
      
        if (current_student_permission !== "")
          socket.emit("set-role", current_student_permission);
      
        //---------------ZOOM-------------
        socket.on("pdf-zoom", (e) => {
          //console.log(e.value);
          zoom_pdf = e.value;
          io.emit("change-pdf-zoom", { value: zoom_pdf });
        });
      
        socket.emit("pdf-current-zoom", { value: zoom_pdf });
      
        //-------------SROLL___________
        socket.on("scrolling-pdf", (e) => {
          scroll_position.ratioX = e.ratioX;
          scroll_position.ratioY = e.ratioY;
          if (scroll_position.ratioX !== null && scroll_position.ratioY !== null)
            io.emit("sync-scrolling-pdf", scroll_position);
        });
        if (scroll_position.ratioX !== null && scroll_position.ratioY !== null)
          socket.emit("sync-scrolling-pdf-first-access", scroll_position);
      
        socket.on("disconnect", () => {
          console.log("A user disconnected");
        });
      });
  }