import faqs from "../Models/faq.js"; 

const FaqController = {
  get: async (req, res) => {
    try {
      const faqList = await faqs.find({});
      res.status(200).json(faqList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  post: async (req, res) => {
    const { question, answer } = req.body;
    try {
      const newFaq = new faqs({
        question,
        answer,
      });
      await newFaq.save();
      res.status(201).json(newFaq);
    } catch (error) {
      res.status(500).json({ error: error.message }); 
    }
  },

 put: async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body; 
  try {
    // מעבירים אובייקט שמכיל רק את השדות המותרים לעדכון
    const updatedFaq = await faqs.findByIdAndUpdate(
      id,
      { question, answer },
      {
        new: true,
        runValidators: true, // כדי לבצע ולידציה - זה לא קורה אוטומטית בעדכון
      }
    );

    if (!updatedFaq) {
      return res.status(404).json({ message: "Faq not found" });
    }

    res.status(200).json(updatedFaq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
  delete: async (req, res) => {
    const { id } = req.params; 
    try {
      const deletedFaq = await faqs.findByIdAndDelete(id);
      if (!deletedFaq) {
        return res.status(404).json({ message: "Faq not found" });
      }
      res.status(200).json(deletedFaq);
    } catch (error) {
      res.status(500).json({ error: error.message }); 
    }
  },
};

export default FaqController;