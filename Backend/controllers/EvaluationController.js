const Schedule = require('../models/Schedule');
const Evaluation = require('../models/Evaluation');

exports.getStudentsForEvaluation = async (req, res) => {
  try {
    const examinerId = req.query.examinerId; // Get examinerId from query parameter
    if (!examinerId) {
      return res.status(400).json({ message: 'examinerId is required' });
    }

    const schedules = await Schedule.find({ examinerId }).populate('studentId', 'name');
    const students = await Promise.all(
      schedules.map(async (schedule) => {
        const evaluation = await Evaluation.findOne({
          studentId: schedule.studentId,
          examinerId,
          module: schedule.module,
        });
        return {
          id: schedule.studentId._id.toString(), // Ensure ID is a string for frontend
          name: schedule.studentId.name,
          module: schedule.module,
          grade: evaluation ? evaluation.grade : '',
          presentation: evaluation ? evaluation.presentation : '',
          evaluated: !!evaluation,
        };
      })
    );
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
};

exports.submitEvaluations = async (req, res) => {
  try {
    const { examinerId, evaluations } = req.body; 
    if (!examinerId || !Array.isArray(evaluations) || evaluations.length === 0) {
      return res.status(400).json({ message: 'examinerId and evaluations array are required' });
    }

    const savedEvaluations = await Promise.all(
      evaluations.map(async (eval) => {
        const { studentId, grade, presentation, module } = eval;
        const existingEval = await Evaluation.findOne({ studentId, examinerId, module });
        if (existingEval) return null;

        const evaluation = new Evaluation({
          studentId,
          examinerId,
          module,
          grade,
          presentation,
        });
        return evaluation.save();
      })
    );

    const successfulEvaluations = savedEvaluations.filter((eval) => eval !== null);
    res.status(201).json({
      message: 'Evaluations submitted successfully',
      evaluations: successfulEvaluations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while submitting evaluations' });
  }
};
//get students Evaluation grade and module by studentId

exports.getStudentEvaluation = async (req, res) => {
  try {
    const studentId = req.query.studentId; // Get studentId from query parameter
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const evaluations = await Evaluation.find({ studentId }).populate('examinerId', 'name');
    const formattedEvaluations = evaluations.map((evaluation) => ({
      id: evaluation._id.toString(), // Ensure ID is a string for frontend
      module: evaluation.module,
      grade: evaluation.grade,
      presentation: evaluation.presentation,
      examinerName: evaluation.examinerId.name,
    }));
    res.status(200).json(formattedEvaluations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching evaluations' });
  }
};
