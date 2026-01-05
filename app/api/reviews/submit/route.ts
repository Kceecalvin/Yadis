/**
 * Submit customer review/feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, review, name, email } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!review || review.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (review.length > 500) {
      return NextResponse.json(
        { error: 'Review must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Log the review (in a real app, save to database)
    console.log('📝 NEW CUSTOMER REVIEW:', {
      name: name || session.user.name || 'Anonymous',
      email: email || session.user.email,
      rating,
      review,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your review! We appreciate your feedback.',
      review: {
        name: name || session.user.name || 'Anonymous',
        rating,
        review,
      },
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET endpoint to get reviews
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to submit a review',
    requirements: {
      authenticated: true,
      fields: ['rating (1-5)', 'review (10-500 chars)', 'name (optional)', 'email (optional)'],
    },
  });
}
