import dbConnect from '@/lib/mongodb';
import Alert from '@/models/Alert';
import PharmacyItem from '@/models/PharmacyItem';
import LabRequest from '@/models/LabRequest';

/**
 * Check pharmacy stock and create alerts for low/out-of-stock items.
 */
export async function checkPharmacyAlerts() {
  try {
    await dbConnect();
    const lowItems = await PharmacyItem.find({
      $or: [{ status: 'low-stock' }, { status: 'out-of-stock' }],
    }).lean();

    for (const item of lowItems) {
      const existing = await Alert.findOne({
        module: 'pharmacy',
        title: { $regex: item.name, $options: 'i' },
        isResolved: false,
      });

      if (!existing) {
        const isOut = item.status === 'out-of-stock';
        await Alert.create({
          type: isOut ? 'error' : 'warning',
          title: `${isOut ? 'Out of stock' : 'Low stock'} — ${item.name}`,
          message: `Remaining: ${item.quantity} ${item.unit}. ${isOut ? 'Immediate resupply required.' : 'Resupply recommended.'}`,
          module: 'pharmacy',
        });
      }
    }
  } catch (error) {
    console.error('Pharmacy alert check error:', error);
  }
}

/**
 * Check for lab requests pending > 2 hours and create alerts.
 */
export async function checkLabAlerts() {
  try {
    await dbConnect();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const pendingLabs = await LabRequest.countDocuments({
      status: { $in: ['requested', 'sample-collected', 'in-progress'] },
      createdAt: { $lt: twoHoursAgo },
    });

    if (pendingLabs > 0) {
      const existing = await Alert.findOne({
        module: 'lab',
        title: { $regex: 'results.*pending', $options: 'i' },
        isResolved: false,
      });

      if (!existing) {
        await Alert.create({
          type: 'warning',
          title: `${pendingLabs} LIS result${pendingLabs > 1 ? 's' : ''} pending`,
          message: `Analyses pending for > 2h. Check the laboratory module.`,
          module: 'lab',
        });
      }
    }
  } catch (error) {
    console.error('Lab alert check error:', error);
  }
}
