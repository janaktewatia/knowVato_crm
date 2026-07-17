const mongoose = require('mongoose');

async function main() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp_crm';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const schema = new mongoose.Schema({}, { strict: false, collection: 'workflowconfigs' });
    const WorkflowConfig = mongoose.model('WorkflowConfig', schema);
    const doc = await WorkflowConfig.findOne({ key: 'enquiryForms' }).lean();
    if (!doc) {
      console.log('No workflow config found for key: enquiryForms');
      process.exit(0);
    }
    const forms = (doc.data && Array.isArray(doc.data.forms)) ? doc.data.forms : [];
    if (!forms.length) {
      console.log('No enquiry forms saved.');
      process.exit(0);
    }
    console.log('Found', forms.length, 'form(s):');
    forms.forEach((f, i) => {
      console.log('\n--- Form', i + 1, '---');
      console.log('id:', f._id);
      console.log('name:', f.name || f.heading || '(no name)');
      console.log('isActive:', !!f.isActive);
      console.log('columns:', f.columns);
      console.log('width:', f.width);
      console.log('fields:', (f.fields || []).length);
    });
    process.exit(0);
  } catch (e) {
    console.error('Error:', e && e.message ? e.message : e);
    process.exit(1);
  }
}

main();
