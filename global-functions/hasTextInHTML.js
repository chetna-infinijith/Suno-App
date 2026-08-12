const hasTextInHTML = html => {
    if (!html) return false;
    // Remove HTML tags and extra spaces
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 0;
  };
  
  export default hasTextInHTML;