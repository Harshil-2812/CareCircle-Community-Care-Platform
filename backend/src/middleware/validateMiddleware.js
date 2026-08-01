const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

// Auth schemas
const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Admin', 'Family', 'Volunteer'])
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Elderly schemas
const elderlySchema = z.object({
  name: z.string().min(2),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  living_type: z.enum(['Home', 'Care_Home']),
  location_id: z.number().int().positive().optional().nullable()
});

// Task schemas
const taskSchema = z.object({
  elderly_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  home_id: z.number().int().positive().optional().nullable(),
  description: z.string().optional(),
  task_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  task_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional()
});

// Assignment schemas
const assignmentSchema = z.object({
  task_id: z.number().int().positive(),
  volunteer_id: z.number().int().positive()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  elderlySchema,
  taskSchema,
  assignmentSchema
};
