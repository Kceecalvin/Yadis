import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    // In production, delete from database
    return NextResponse.json({
      success: true,
      message: 'Delivery zone deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery zone' },
      { status: 500 }
    );
  }
}
