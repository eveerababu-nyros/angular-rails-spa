class Api::V1::AdminsController < Api::V1::BaseController
  before_filter :authenticate_admin!, :except => [:create, :show]

  respond_to :json

  def show
    render :json => {:info => "Current Admin", :admin => current_admin}, :status => 200
  end

  def create
    @user = Admin.new()
		@user.email = params[:admin][:email]
		@user.password = params[:admin][:password]
		@user.save
    if @user.valid?
      sign_in(@user)
      respond_with User.all, :location => users_path
    else
      respond_with @user.errors, :location => users_path
    end
  end

  def update
    respond_with :api, Admin.update(current_admin.id, admin_params)
  end

  def destroy
    respond_with :api, Admin.find(current_admin.id).destroy
  end

  def index
    respond_with(@admins = Admin.all)
  end

end
