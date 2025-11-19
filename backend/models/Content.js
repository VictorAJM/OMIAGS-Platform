import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ["video", "pdf", "text", "quiz"],
    required: true,
  },
  // Para Videos (Youtube) y PDFs
  url: { 
    type: String,
    required: function() { return this.type === 'video' || this.type === 'pdf'; }
  },
  // Para contenido de puro texto/HTML
  textContent: { 
    type: String,
    required: function() { return this.type === 'text'; }
  },
  // Para referencia al modelo de Quiz existente
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz", // Asumiendo que tu modelo se llama 'Quiz'
    required: function() { return this.type === 'quiz'; }
  }
}, { _id: false }); // _id false para que sean subdocumentos ligeros, o true si quieres trackearlos individualmente

export default contentSchema;